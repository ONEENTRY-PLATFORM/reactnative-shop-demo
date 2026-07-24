import {defineApi} from '../../../api';
import {IError} from 'oneentry/dist/base/utils';
import {InputValue} from '../../ui/inputs/AppInput';
import {IFormConfig} from 'oneentry/dist/forms/formsInterfaces';
import {IBodyPostFormData} from 'oneentry/dist/forms-data/formsDataInterfaces';

type FormDataItem = IBodyPostFormData['formData'][number];

export const submitContactUsForm = async (
  fields: {[p: string]: InputValue},
  onSuccess: () => void,
  onError: () => void,
  config: IFormConfig | undefined,
  formIdentifier: string | undefined,
) => {
  if (!config || !formIdentifier) {
    console.error('Missing config or formIdentifier');
    onError();
    return;
  }

  const emptyFormData: FormDataItem[] = [];
  if (fields) {
    let propertiesArray = Object.entries(fields);

    const transformedFormData = propertiesArray?.reduce(
      (formData, [key, value]) => {
        if (!value.value) {
          return formData;
        }
        let newData: FormDataItem = {
          marker: key,
          type: 'string',
          value: value.value,
        } as FormDataItem;
        if (key === 'topic') {
          newData = {
            marker: key,
            type: 'list',
            value: [value.value],
          } as FormDataItem;
        }

        if (key === 'text') {
          newData = {
            marker: key,
            type: 'text',
            value: [
              {
                htmlValue: `<p>${value.value}</p>`,
                plainValue: String(value.value),
                params: {
                  isEditorDisabled: false,
                  isImageCompressed: true,
                },
              },
            ],
          } as FormDataItem;
        }

        if (newData) {
          formData.push(newData);
        }
        return formData;
      },
      emptyFormData,
    );
    const formData: IBodyPostFormData = {
      formIdentifier: formIdentifier,
      formData: transformedFormData,
      formModuleConfigId: config.id,
      moduleEntityIdentifier: config.entityIdentifiers?.[0]?.id,
      replayTo: null,
      status: 'sent',
    };

    console.log(
      'Submitting form with data:',
      JSON.stringify(formData, null, 2),
    );

    try {
      const res = await defineApi.FormData.postFormsData(formData);
      if ((res as IError)?.statusCode >= 400) {
        console.error('Form submission error:', (res as IError)?.message);
        throw new Error((res as IError)?.message);
      }

      console.log('Form submitted successfully');
      onSuccess();
    } catch (e: any) {
      console.error('Form submission failed:', e);
      onError();
    }
  }
};
