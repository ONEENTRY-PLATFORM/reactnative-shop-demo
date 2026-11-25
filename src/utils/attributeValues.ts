import {getAdditionalFields, getAttributeFile} from 'oneentry';
import type {IAttributeValue} from 'oneentry/dist/base/utils';

/**
 * URL of the first file of an image/file/groupOfImages attribute.
 * Since SDK 1.0.157 a single-file `image` is unwrapped to the file object
 * (`[img]` -> `img`) in every module, so `value[0]` no longer works for blocks,
 * pages, users and orders. getAttributeFile handles both shapes.
 */
export const getImageUrl = (attr: unknown): string | undefined =>
  getAttributeFile(attr as IAttributeValue | undefined)?.downloadLink ||
  undefined;

/**
 * First item of a list value; tolerates a value that is already a single object.
 */
export const getFirstItem = <T = any>(value: unknown): T | undefined =>
  (Array.isArray(value) ? value[0] : value) as T | undefined;

/**
 * Value of a nested additional field of an attribute (e.g. 'placeholder').
 * Since SDK 1.0.163 `additionalFields` is a marker map (an empty array when
 * there are none), so `additionalFields.find(...)` throws.
 */
export const getAdditionalFieldValue = (
  attr: unknown,
  marker?: string,
): any => {
  const fields = getAdditionalFields(attr as IAttributeValue | undefined);
  const field = marker ? fields[marker] : Object.values(fields)[0];
  return field?.value;
};
