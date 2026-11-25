import React from 'react';
import {ScrollView} from 'react-native';
import OfferHorizontalItem from './OfferHorizontalItem';
import {IPositionBlock} from 'oneentry/dist/pages/pagesInterfaces';
import {layoutPadding} from '../../../../utils/consts';
import {getImageUrl} from '../../../../utils/attributeValues';

interface Props {
  products?: IPositionBlock[];
}

const HorizontalOffersBlock: React.FC<Props> = ({products}) => {
  return (
    <ScrollView
      contentContainerStyle={{paddingHorizontal: layoutPadding, gap: 20}}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {products?.map((offer, index) => {
        return (
          <OfferHorizontalItem
            sticker={
              (offer.attributeValues.stickers?.value as any[])?.[0]?.extended
                ?.value?.downloadLink
            }
            bg={getImageUrl(offer.attributeValues?.bg)}
            item={getImageUrl(offer.attributeValues?.item_img)}
            text={offer.attributeValues?.title?.value as string}
            productId={offer.attributeValues?.product_id?.value as number}
            sticker_name={
              (offer.attributeValues.stickers?.value as any[])?.[0]?.value
            }
            key={index}
          />
        );
      })}
    </ScrollView>
  );
};

export default HorizontalOffersBlock;
