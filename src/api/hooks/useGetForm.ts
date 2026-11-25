import {useEffect, useRef, useState} from 'react';
import {
  IFormAttribute,
  IFormsEntity,
} from 'oneentry/dist/forms/formsInterfaces';
import {defineApi} from '../api/defineApi';
import {isError} from '../api/RTKApi';

type UseGetFormProps = {
  marker: string;
};

const notEditableTypes: {[key: string]: any} = {
  button: false,
  spam: false,
  null: true,
};

export interface FormDataType {
  [p: string]: {
    value: string;
    valid: boolean;
    required: boolean;
  };
}

export const useGetForm = ({marker}: UseGetFormProps) => {
  const [form, setForm] = useState<IFormsEntity>();
  const [loading, setLoading] = useState<boolean>(false);
  const appFormData = useRef<FormDataType | null>(null);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const result = await defineApi.Forms.getFormByMarker(marker);

        if (isError(result)) {
          throw new Error(result?.message);
        }

        // Проверяем что attributes существует и является массивом
        if (Array.isArray(result.attributes)) {
          result.attributes = (result.attributes as IFormAttribute[]).sort(
            (a, b) => {
              return a.position - b.position;
            },
          );
          const initValue: FormDataType = {};
          const reduced = (result?.attributes as IFormAttribute[]).reduce(
            (obj, currentValue) => {
              if (notEditableTypes[currentValue.type] === false) {
                return obj;
              }

              // SDK 1.0.186: requiredValidator is either {strict} or a plain boolean
              const requiredValidator =
                currentValue?.validators?.requiredValidator;
              obj[currentValue.marker] = {
                value: '',
                valid: false,
                required:
                  typeof requiredValidator === 'boolean'
                    ? requiredValidator
                    : !!(requiredValidator as {strict?: boolean} | undefined)
                        ?.strict,
              };
              return obj;
            },
            initValue,
          );
          appFormData.current = reduced;
        }

        setForm(result as IFormsEntity);
      } catch (e) {
        console.log('Error fetching form:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [refetch, marker]);

  return {
    loading,
    form,
    initialFormData: appFormData.current,
    refetch() {
      setRefetch(!refetch);
    },
  };
};
