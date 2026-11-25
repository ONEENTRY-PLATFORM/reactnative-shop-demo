import {View, ScrollView} from 'react-native';
import React, {Dispatch, useState} from 'react';
import CustomModal from '../../shared/CustomModal';
import {Screen} from '../../ui/templates/Screen';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import CustomImage from '../../ui/templates/CustomImage';
import {Paragraph} from '../../ui/texts/Paragraph';
import StarRating from './StarReating';
import AddPhoto from './AddPhoto';
import CustomInput from '../../ui/inputs/CustomInput';
import {styleColors} from '../../../utils/consts';
import {useAppSelector} from '../../../state/hooks';
import BigButton from '../../shared/BigButton';
import useSubmitReview from './useSubmitReview';
import Toast from 'react-native-toast-message';
import {useGetForm} from '../../../api';

type Props = {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  title: string;
  product: IProductsEntity;
};

const LeaveReviewModal = ({visible, setVisible, title, product}: Props) => {
  const {add_photos} = useAppSelector(
    state => state.systemContentReducer.content,
  );
  const {loading, form, refetch} = useGetForm({
    marker: 'comment_to_product',
  });
  const {submitReview} = useSubmitReview();
  const [rating, setRating] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!rating && !review && !images.length) {
      return;
    }

    try {
      setIsSubmitting(true);
      // The product's module config carries `isModerate` (the Forms API does not)
      const config =
        product?.moduleFormConfigs?.find(
          item => item.formIdentifier === 'comment_to_product',
        ) || form?.moduleFormConfigs?.[0];
      const result = await submitReview({
        rating: rating || 0,
        review,
        images,
        config,
        productId: product?.id,
      });
      setVisible(false);
      setRating(null);
      setImages([]);
      setReview('');
      Toast.show({
        type: 'success',
        text1: result.moderated
          ? 'Thank you! Your review will appear after moderation.'
          : 'Thank you for your review!',
      });
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      Toast.show({
        type: 'error',
        text1: error?.message || 'Failed to submit review',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal visible={visible} setVisible={setVisible} title={title}>
      <Screen isFull edges={['top', 'horizontal']}>
        <ScrollView contentContainerStyle={{gap: 20}}>
          <View className="mt-20">
            <View className={'flex-row w-full gap-4'}>
              <View>
                <CustomImage
                  uri={
                    (product?.attributeValues?.pic?.value as any)?.downloadLink
                  }
                  height={72}
                  width={62}
                />
              </View>
              <View className="gap-2.5 items-center justify-center">
                <View className={'flex-row items-center justify-between'}>
                  <Paragraph size={21} weight="400">
                    {product?.localizeInfos?.title}
                  </Paragraph>
                </View>
              </View>
            </View>
          </View>
          <View className="mt-4 w-2/3 gap-y-2.5">
            <Paragraph size={16} weight="400" color="gray">
              Rate this product
            </Paragraph>
            <StarRating
              starSize={40}
              rating={rating}
              onRatingChange={setRating}
            />
          </View>
          <View className="gap-y-2.5">
            <Paragraph size={16} weight="400" color="gray">
              {add_photos}
            </Paragraph>
            <AddPhoto images={images} onImagesChange={setImages} />
          </View>
          <View>
            <CustomInput
              title="Review"
              titleSize={16}
              multiline
              paragraphProps={{color: 'gray'}}
              placeholder="Write your review"
              value={review}
              onChangeText={setReview}
              numberOfLines={3}
              placeholderTextColor={styleColors.lightGray}
              style={{
                height: 100,
                padding: 10,
                borderColor: styleColors.lightGray,
                borderWidth: 1,
                borderRadius: 15,
              }}
            />
          </View>
        </ScrollView>
        <View className="absolute bottom-20 left-0 right-0 px-layout">
          <BigButton
            disabled={(!rating && !review && !images.length) || isSubmitting}
            title="Submit"
            action={onSubmit}
            isLoading={isSubmitting}
          />
        </View>
      </Screen>
    </CustomModal>
  );
};

export default LeaveReviewModal;
