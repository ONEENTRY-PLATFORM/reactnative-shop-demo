import {IFormConfig} from 'oneentry/dist/forms/formsInterfaces';
import {defineApi} from '../../../api';
import {isError} from '../../../api/api/RTKApi';
import {
  IBodyPostFormData,
  IImageValue,
} from 'oneentry/dist/forms-data/formsDataInterfaces';
import {IError} from 'oneentry/dist/base/utils';
import {File} from 'expo-file-system';

type Props = {
  rating: number;
  images: string[];
  review: string;
  config?: IFormConfig;
  productId?: number;
};

// Markers of the comment_to_product form (same as the web shop)
const RATING_MARKER = 'rating';
const CONTENT_MARKER = 'comment_description';
const ATTACHMENTS_MARKER = 'comment_attachments';

/**
 * Uploads a picked image (local file URI) and returns the value the form
 * expects. Expo's fetch (the global fetch in this Expo 58 app) sends only
 * strings and Blob-like parts in FormData, not React Native's `{uri}` objects,
 * so the picked file is passed as an expo-file-system File (implements Blob).
 */
const uploadImage = async (
  uri: string,
  productId: number,
): Promise<IImageValue> => {
  const file = new File(uri) as unknown as Blob;

  const result = await defineApi.FileUploading.upload(file, {
    type: 'catalog',
    entity: 'editor',
    id: productId,
  });
  if (isError(result) || !Array.isArray(result) || !result[0]) {
    throw new Error(
      (result as IError)?.message || 'Failed to upload the photo',
    );
  }

  // form data rejects `contentType`, which the uploader returns
  const {filename, downloadLink, size} = result[0];
  return {
    filename,
    downloadLink,
    size,
    previewLink: '',
    params: {isImageCompressed: false},
  } as IImageValue;
};

const UseSubmitReview = () => {
  const submitReview = async ({
    rating,
    images,
    review,
    config,
    productId,
  }: Props) => {
    try {
      if (!config) {
        throw new Error('Form config is missing');
      }
      if (!productId) {
        throw new Error('Product is missing');
      }

      const formDataArray: IBodyPostFormData['formData'] = [];

      if (rating) {
        formDataArray.push({
          marker: RATING_MARKER,
          type: 'integer',
          value: rating,
        });
      }

      const text = review.trim();
      if (text) {
        formDataArray.push({
          marker: CONTENT_MARKER,
          type: 'string',
          value: text,
        });
      }

      if (images?.length) {
        const uploaded = await Promise.all(
          images.map(uri => uploadImage(uri, productId)),
        );
        formDataArray.push({
          marker: ATTACHMENTS_MARKER,
          type: 'groupOfImages',
          value: uploaded,
        });
      }

      const formData: IBodyPostFormData = {
        formIdentifier: 'comment_to_product',
        formData: formDataArray,
        formModuleConfigId: config.id,
        // the review belongs to the product, as in the web shop
        moduleEntityIdentifier: String(productId),
        replayTo: null,
        // respect the premoderation switch of the module (as in the web shop)
        status: config.isModerate === true ? 'sent' : 'approved',
      };

      const res = await defineApi.FormData.postFormsData(formData);
      if (isError(res)) {
        throw new Error((res as IError)?.message || 'Failed to submit review');
      }

      return {success: true, moderated: config.isModerate === true};
    } catch (e: any) {
      console.error('Review submission failed:', e?.message || e);
      throw e;
    }
  };

  return {
    submitReview,
  };
};

export default UseSubmitReview;
