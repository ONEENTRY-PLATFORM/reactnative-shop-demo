import {IFormConfig} from 'oneentry/dist/forms/formsInterfaces';
import {defineApi} from '../../../api';
import {isError} from '../../../api/api/RTKApi';
import {IBodyPostFormData} from 'oneentry/dist/forms-data/formsDataInterfaces';
import {IError} from 'oneentry/dist/base/utils';

type Props = {
  rating: number;
  images: string[];
  review: string;
  config?: IFormConfig;
  productId?: number;
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

      const formDataArray: any[] = [];

      // Add rating
      if (rating) {
        formDataArray.push({
          marker: 'rating',
          type: 'integer',
          value: rating,
        });
      }
      //
      // // Add review text
      // if (review) {
      //   formDataArray.push({
      //     marker: 'comment_description',
      //     type: 'string',
      //     value: review,
      //   });
      // }

      // // Add images
      // if (images && images.length > 0) {
      //   formDataArray.push({
      //     marker: 'comment_attachments',
      //     type: 'image',
      //     value: images,
      //   });
      // }

      console.log(config);
      const formData: IBodyPostFormData = {
        formIdentifier: 'comment_to_product',
        formData: formDataArray,
        formModuleConfigId: config.id,
        moduleEntityIdentifier: 'category',
        replayTo: null,
        status: 'sent',
      };

      console.log('Submitting review:', JSON.stringify(formData, null, 2));

      const res = await defineApi.FormData.postFormsData(formData);
      if (isError(res)) {
        throw new Error((res as IError)?.message || 'Failed to submit review');
      }

      console.log('Review submitted successfully');
      return {success: true};
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
