import React, {memo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Star from '../../../assets/icons/StarReview.svg';
import {styleColors} from '../../../utils/consts';

interface Props {
  rating: number;
  onRatingChange: (rating: number) => void;
  starSize?: number;
  disabled?: boolean;
}

const StarRating: React.FC<Props> = ({
  rating,
  onRatingChange,
  starSize = 20,
  disabled = false,
}) => {
  const handleStarPress = (selectedRating: number) => {
    if (!disabled) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(starNumber => (
        <TouchableOpacity
          key={starNumber}
          onPress={() => handleStarPress(starNumber)}
          disabled={disabled}
          style={styles.starButton}>
          <Star
            width={starSize}
            height={starSize}
            fill={starNumber <= rating ? styleColors.background : 'transparent'}
            stroke={
              starNumber <= rating ? styleColors.background : 'transparent'
            }
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starButton: {
    padding: 2,
  },
});

export default memo(StarRating);
