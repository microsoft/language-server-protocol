#### <a href="#staticRegistrationOptions" name="staticRegistrationOptions" class="anchor"> StaticRegistrationOptions </a>

Static registration options can be used to register a feature in the initialize result with a given server control ID to be able to un-register the feature later on.

```typescript
/**
 * Static registration options to be returned in the initialize request.
 */
export interface StaticRegistrationOptions {
	/**
	 * The id used to register the request. The id can be used to deregister
	 * the request again. See also Registration#id.
	 */
	id?: string;
}
```