#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultSpecRepository = resolve(scriptDirectory, '..', '..', '..', '..');

function printUsage() {
	console.log(`Usage:
  node compare-meta-model.mjs --node-repo <path> [--spec-repo <path>] [--spec-version <major.minor>]

Options:
  --node-repo     Root of microsoft/vscode-languageserver-node.
  --spec-repo     Root of microsoft/language-server-protocol.
                  Defaults to the repository containing this skill.
  --spec-version  LSP specification series, for example 3.18.
                  Defaults to the entry marked Current in specifications.yml.
  --help          Show this help.

The VSCODE_LANGUAGESERVER_NODE_REPO environment variable can be used instead
of --node-repo.`);
}

function fail(message) {
	console.error(`Error: ${message}`);
	process.exitCode = 2;
}

function parseArguments(argumentsToParse) {
	const options = {};

	for (let index = 0; index < argumentsToParse.length; index++) {
		const argument = argumentsToParse[index];
		if (argument === '--help') {
			options.help = true;
			continue;
		}

		if (argument !== '--node-repo' && argument !== '--spec-repo' && argument !== '--spec-version') {
			throw new Error(`Unknown argument: ${argument}`);
		}

		const value = argumentsToParse[++index];
		if (value === undefined || value.startsWith('--')) {
			throw new Error(`Missing value for ${argument}`);
		}

		if (argument === '--node-repo') {
			options.nodeRepository = value;
		} else if (argument === '--spec-repo') {
			options.specRepository = value;
		} else {
			options.specVersion = value;
		}
	}

	return options;
}

function hasMarkers(repository, markers) {
	return markers.every((marker) => existsSync(join(repository, marker)));
}

function validateSpecRepository(repository) {
	const markers = [
		'_data/specifications.yml',
		'_specifications/lsp'
	];

	if (!hasMarkers(repository, markers)) {
		throw new Error(
			`Specification repository not found at "${repository}". ` +
			`Expected ${markers.join(' and ')}.`
		);
	}
}

function validateNodeRepository(repository) {
	const markers = [
		'protocol/package.json',
		'tools/src/metaModel.ts',
		'types/src/main.ts'
	];

	if (!hasMarkers(repository, markers)) {
		throw new Error(
			`Node repository not found at "${repository}". ` +
			`Expected ${markers.join(', ')}.`
		);
	}
}

function findNodeRepository(specRepository, requestedRepository) {
	if (requestedRepository !== undefined) {
		const repository = resolve(requestedRepository);
		validateNodeRepository(repository);
		return repository;
	}

	const environmentRepository = process.env.VSCODE_LANGUAGESERVER_NODE_REPO;
	if (environmentRepository !== undefined && environmentRepository.length > 0) {
		const repository = resolve(environmentRepository);
		validateNodeRepository(repository);
		return repository;
	}

	const parent = dirname(specRepository);
	const candidates = [
		join(parent, 'vscode-languageserver-node'),
		join(parent, 'Node')
	];

	for (const candidate of candidates) {
		if (hasMarkers(candidate, [
			'protocol/package.json',
			'tools/src/metaModel.ts',
			'types/src/main.ts'
		])) {
			return candidate;
		}
	}

	throw new Error(
		'Unable to locate microsoft/vscode-languageserver-node. ' +
		'Pass --node-repo or set VSCODE_LANGUAGESERVER_NODE_REPO.'
	);
}

function readCurrentSpecVersion(specRepository) {
	const configurationPath = join(specRepository, '_data', 'specifications.yml');
	const configuration = readFileSync(configurationPath, 'utf8');
	const lspSection = configuration.split(/\r?\n- title:\s+LSIF(?:\r?\n|$)/u)[0];
	const currentMatch = lspSection.match(
		/^\s*-\s+title:\s+(\d+\.\d+)\s+\(Current\)\s*$[\s\S]*?^\s+version:\s+(\d+\.\d+)\s*$/mu
	);

	if (currentMatch === null) {
		throw new Error(`No current LSP version found in "${configurationPath}".`);
	}

	if (currentMatch[1] !== currentMatch[2]) {
		throw new Error(
			`Current LSP title ${currentMatch[1]} does not match version ${currentMatch[2]} ` +
			`in "${configurationPath}".`
		);
	}

	return currentMatch[1];
}

function validateSpecVersion(version) {
	if (!/^\d+\.\d+$/u.test(version)) {
		throw new Error(`Invalid specification version "${version}". Expected <major>.<minor>.`);
	}
}

function canonicalize(value) {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}

	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(
			Object.keys(value)
				.sort()
				.map((key) => [key, canonicalize(value[key])])
		);
	}

	return value;
}

function readJson(filePath) {
	return JSON.parse(readFileSync(filePath, 'utf8'));
}

function jsonFilesEqual(leftPath, rightPath) {
	const left = JSON.stringify(canonicalize(readJson(leftPath)));
	const right = JSON.stringify(canonicalize(readJson(rightPath)));
	return left === right;
}

function textFilesEqual(leftPath, rightPath) {
	const normalize = (value) => value.replace(/\r\n?/gu, '\n');
	return normalize(readFileSync(leftPath, 'utf8')) === normalize(readFileSync(rightPath, 'utf8'));
}

function relativeArtifactPaths(specVersion) {
	return [
		{
			label: 'Protocol meta model',
			nodePath: join('protocol', 'metaModel.json'),
			specPath: join('_specifications', 'lsp', specVersion, 'metaModel', 'metaModel.json'),
			compare: jsonFilesEqual,
			mode: 'semantic JSON'
		},
		{
			label: 'Meta-model TypeScript definitions',
			nodePath: join('tools', 'src', 'metaModel.ts'),
			specPath: join('_specifications', 'lsp', specVersion, 'metaModel', 'metaModel.ts'),
			compare: textFilesEqual,
			mode: 'text with normalized line endings'
		},
		{
			label: 'Meta-model JSON schema',
			nodePath: join('protocol', 'metaModel.schema.json'),
			specPath: join('_specifications', 'lsp', specVersion, 'metaModel', 'metaModel.schema.json'),
			compare: jsonFilesEqual,
			mode: 'semantic JSON'
		}
	];
}

function compareArtifacts(nodeRepository, specRepository, specVersion) {
	const failures = [];

	for (const artifact of relativeArtifactPaths(specVersion)) {
		const nodePath = join(nodeRepository, artifact.nodePath);
		const specPath = join(specRepository, artifact.specPath);

		if (!existsSync(nodePath)) {
			console.error(`FAIL ${artifact.label}: missing Node artifact "${nodePath}"`);
			failures.push(artifact.label);
			continue;
		}

		if (!existsSync(specPath)) {
			console.error(`FAIL ${artifact.label}: missing specification artifact "${specPath}"`);
			failures.push(artifact.label);
			continue;
		}

		if (!artifact.compare(nodePath, specPath)) {
			console.error(`FAIL ${artifact.label} (${artifact.mode})`);
			console.error(`     Node: ${nodePath}`);
			console.error(`     Spec: ${specPath}`);
			failures.push(artifact.label);
			continue;
		}

		console.log(`PASS ${artifact.label} (${artifact.mode})`);
	}

	return failures;
}

function validateMetaModelVersion(nodeRepository, specVersion) {
	const metaModelPath = join(nodeRepository, 'protocol', 'metaModel.json');
	const metaModel = readJson(metaModelPath);
	const modelVersion = metaModel?.metaData?.version;

	if (typeof modelVersion !== 'string') {
		console.error(`FAIL Meta-model version: missing metaData.version in "${metaModelPath}"`);
		return false;
	}

	const modelSeries = modelVersion.split('.').slice(0, 2).join('.');
	if (modelSeries !== specVersion) {
		console.error(
			`FAIL Meta-model version: Node model ${modelVersion} targets ${modelSeries}, ` +
			`not specification ${specVersion}`
		);
		return false;
	}

	console.log(`PASS Meta-model version ${modelVersion} targets specification ${specVersion}`);
	return true;
}

let options;
try {
	options = parseArguments(process.argv.slice(2));
} catch (error) {
	fail(error instanceof Error ? error.message : String(error));
	printUsage();
}

if (options !== undefined && options.help === true) {
	printUsage();
} else if (options !== undefined) {
	try {
		const specRepository = resolve(options.specRepository ?? defaultSpecRepository);
		validateSpecRepository(specRepository);

		const specVersion = options.specVersion ?? readCurrentSpecVersion(specRepository);
		validateSpecVersion(specVersion);

		const nodeRepository = findNodeRepository(specRepository, options.nodeRepository);

		console.log(`Specification repository: ${specRepository}`);
		console.log(`Node repository:          ${nodeRepository}`);
		console.log(`LSP version:              ${specVersion}`);
		console.log('');

		const failures = compareArtifacts(nodeRepository, specRepository, specVersion);
		if (!validateMetaModelVersion(nodeRepository, specVersion)) {
			failures.push('Meta-model version');
		}

		if (failures.length > 0) {
			console.error('');
			console.error(`Meta-model consistency failed (${failures.length} check(s)).`);
			console.error(
				'Regenerate the Node artifacts, inspect the generated diff, synchronize the ' +
				'intended files into the specification, and rerun this command.'
			);
			process.exitCode = 1;
		} else {
			console.log('');
			console.log('All mirrored meta-model artifacts are consistent.');
		}
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}
