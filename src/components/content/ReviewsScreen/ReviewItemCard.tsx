import React, {useState} from 'react';
import {View} from 'react-native';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {Paragraph} from '../../ui/texts/Paragraph';
import Rating from '../../shared/Rating';
import OpenReviewsButton from '../../shared/OpenReviewsButton';
import CustomImage from '../../ui/templates/CustomImage';
import BigButton from '../../shared/BigButton';
import LeaveReviewModal from './LeaveReviewModal';
import {useAppSelector} from '../../../state/hooks';

type Props = {
  product: IProductsEntity;
};

const ReviewItemCard: React.FC<Props> = ({product}) => {
  const {write_a_review} = useAppSelector(
    state => state.systemContentReducer.content,
  );
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <View className={'flex-row w-full gap-4'}>
        <View>
          <CustomImage
            uri={(product?.attributeValues?.pic?.value as any)?.downloadLink}
            height={72}
            width={62}
          />
        </View>
        <View style={{gap: 5}}>
          <View className={'flex-row items-start justify-between'}>
            <Paragraph size={21} weight="400">
              {product?.localizeInfos?.title}
            </Paragraph>
          </View>
          <View className={'flex-row items-start'}>
            <Rating rating={3.5} />
            <OpenReviewsButton reviewsCount={120} />
          </View>
        </View>
      </View>
      <View>
        <BigButton title={'Add review'} action={() => setVisible(true)} />
      </View>
      <LeaveReviewModal
        product={product}
        visible={visible}
        setVisible={setVisible}
        title={write_a_review}
      />
    </View>
  );
};

export default ReviewItemCard;
