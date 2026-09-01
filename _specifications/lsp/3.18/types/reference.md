#### <a href="#reference" name="reference" class="anchor">Reference</a>

> *Since version 3.18.0*

Represents a reference inside the workspace. A reference has a location and can have one or more tags.

```typescript
interface Reference {
    /**
     * The location of this reference.
     * @since 3.18.0
     */
    location: Location;
    /**
     * Optional, one or more tags describing this reference.
     * @since 3.18.0
     */
    referenceTags?: ReferenceTag[];
}
```
