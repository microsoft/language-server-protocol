#### <a href="#location" name="location" class="anchor"> Location </a>

Represents a location inside a resource, such as a line inside a text file.
```typescript
interface Location {
	uri: DocumentUri;
	range: Range;
}
```