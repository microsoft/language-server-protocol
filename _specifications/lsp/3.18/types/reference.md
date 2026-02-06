#### <a href="#reference" name="reference" class="anchor">Reference</a>

Represents a reference inside the workspace. A reference has a location and can have one or more tags.
```typescript
interface Reference {
	location: Location;
	referenceTags: ReferenceTag[];
}
```
