import React, {memo, useEffect, useState} from 'react';
import {FlatList, ActivityIndicator, View} from 'react-native';
import UserReview from './UserReview';
import Footer from '../../ui/space/Footer';
import {defineApi} from '../../../api';
import {isError} from '../../../api/api/RTKApi';
import {useGetForm} from '../../../api';
import {Paragraph} from '../../ui/texts/Paragraph';
import {useRoute, RouteProp} from '@react-navigation/native';
import {DrawerStackNavigatorParamList} from '../../../navigation/types/DrawerStackNavigatorParamList';

type Props = object;

interface ReviewData {
  review: string;
  mark: number;
  answers: Array<{author: string; date: string; answer: string}>;
  author: string;
  date: string;
  images: string[];
}

const ReviewsList: React.FC<Props> = () => {
  const route = useRoute<RouteProp<DrawerStackNavigatorParamList, 'reviews'>>();
  const {productId} = route.params || {};
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const {form} = useGetForm({marker: 'comment_to_product'});

  const loadReviews = async () => {
    try {
      if (!form?.moduleFormConfigs[0]?.id) {
        console.log('Form config not available yet');
        return;
      }

      const body = productId ? {entityIdentifier: productId.toString()} : {};

      const result = await defineApi.FormData.getFormsDataByMarker(
        'comment_to_product',
        form.moduleFormConfigs[0].id,
        body,
        1, // isNested - to get nested replies
      );

      if (isError(result)) {
        console.error('Failed to load reviews:', result.message);
        setReviews([]);
        return;
      }

      // Transform API data to ReviewData format
      const transformedReviews: ReviewData[] = result.items.map(item => {
        const ratingField = item.formData.find(f => f.marker === 'rating');
        const reviewField = item.formData.find(f => f.marker === 'review');
        const imagesField = item.formData.find(f => f.marker === 'images');

        return {
          review:
            typeof reviewField?.value === 'string'
              ? reviewField.value
              : (reviewField?.value as any)?.plainValue || '',
          mark: ratingField?.value ? Number(ratingField.value) : 0,
          answers: [], // TODO: handle nested replies
          author: item.userIdentifier || 'Anonymous',
          date: new Date(item.time).toISOString(),
          images: Array.isArray(imagesField?.value)
            ? imagesField.value.map((img: any) => img.downloadLink || '')
            : [],
        };
      });

      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form?.moduleFormConfigs?.[0]?.id) {
      loadReviews();
    }
  }, [form?.moduleFormConfigs?.[0]?.id, productId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center mt-10">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!reviews.length) {
    return (
      <View className="flex-1 justify-center items-center mt-10">
        <Paragraph size={16} color="gray">
          No reviews yet
        </Paragraph>
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      contentContainerStyle={{gap: 15, marginTop: 15}}
      renderItem={({item}) => <UserReview review={item} />}
      ListFooterComponent={<Footer height={100} />}
      keyExtractor={(item, index) => `review-${index}`}
    />
  );
};

export default memo(ReviewsList);
