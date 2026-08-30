#### <a href="#location" name="location" class="anchor">Location</a>

Represents a location inside a resource, such as a line inside a text file.
```typescript
interface Location {
	uri: DocumentUri;
	range: Range;
}
```

<div class="anchorHolder"><a href="#locationUriOnly" name="locationUriOnly" class="linkableAnchor"></a></div>

```typescript
/**
 * Location with only uri and does not include range.
 */
export type LocationUriOnly = {
	uri: DocumentUri;
};
```
