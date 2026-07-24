import {View} from 'react-native';
import React, {useState} from 'react';
import {NavigationProps} from '../../navigation/types/types';
import {Screen} from '../../components/ui/templates/Screen';
import TopSpacerV2 from '../../components/ui/space/TopSpacerV2';
import {useGetShopBlocks} from '../../hooks/content/ShopScreen/useGetShopBlocks';
import {
  ShopProductsList,
  SortFilterMenu,
} from '../../components/content/ShopScreen';
import CatalogBadges from '../../components/shared/CatalogBadges';

/**
 * ShopScreen component represents the main shopping screen.
 * It fetches product configurations and products, handles sorting, filtering, and refreshing.
 *
 * @param {NavigationProps} props - Component props.
 * @returns {React.ReactElement} - Rendered component.
 */
export const ShopScreen: React.FC<NavigationProps> = ({route}) => {
  const [sortOption, setSortOption] = useState<'low' | 'high' | undefined>();

  const pageUrl = route?.params?.pageUrl;

  // Fetch shop blocks (e.g., sort block)
  const {sortBlock} = useGetShopBlocks({pageUrl});

  return (
    <View className={'flex-1'}>
      <Screen className={'bg-lightGray'}>
        <TopSpacerV2 />
        <SortFilterMenu
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortBlock={sortBlock}
        />
      </Screen>
      <Screen white edges={['horizontal']} className={'flex-1'}>
        <CatalogBadges />
        <ShopProductsList pageUrl={pageUrl} sortOption={sortOption} />
      </Screen>
    </View>
  );
};
