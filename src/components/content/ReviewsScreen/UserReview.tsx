import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View, TextInput} from 'react-native';
import {Paragraph} from '../../ui/texts/Paragraph';
import Rating from '../../shared/Rating';
import dayjs from 'dayjs';
import CustomImage from '../../ui/templates/CustomImage';
import Like from '../../../assets/icons/Like.svg';
import {useAppSelector} from '../../../state/hooks';

type Props = {
  review: {
    review: string;
    answers: {
      author: string;
      date: string;
      answer: string;
    }[];
    mark: number;
    date: string;
    author: string;
    images: string[];
  };
};

const UserReview: React.FC<Props> = ({review}) => {
  const {leave_answer} = useAppSelector(
    state => state.systemContentReducer.content,
  );
  const [isAnswer, setIsAnswer] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answersMinimized, setAnswersMinimized] = useState(false);
  const handleSubmitAnswer = () => {
    if (!answerText.trim()) return;
    setAnswerText('');
    setIsAnswer(false);
    setAnswersMinimized(true);
  };

  const renderAnswer = ({
    author,
    date,
    answer,
  }: {
    author: string;
    date: string;
    answer: string;
  }) => {
    return (
      <View
        className={
          'pl-10 py-2.5 gap-2.5 border-l-sm border-orange-400 space-y-2.5'
        }>
        <View className="flex-row items-center justify-between">
          <Paragraph size={18} weight={'500'}>
            {author}
          </Paragraph>
          <Paragraph size={14} color={'gray'}>
            {dayjs(date).format('DD.MM.YYYY')}
          </Paragraph>
        </View>
        <Paragraph size={16}>{answer}</Paragraph>
        <View className="flex-row self-end" style={{gap: 10}}>
          <TouchableOpacity className="flex-row items-center" style={{gap: 10}}>
            <Like />
            <Paragraph color={'gray'}>10</Paragraph>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center" style={{gap: 10}}>
            <View style={{transform: [{rotate: '180deg'}]}}>
              <Like />
            </View>
            <Paragraph color={'gray'}>10</Paragraph>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      className="border-sm border-gray rounded-md px-3 py-5"
      style={{gap: 10}}>
      <View style={{gap: 10}}>
        <View
          className={'flex-row items-center justify-between'}
          style={{gap: 5}}>
          <Paragraph color={'gray'} size={18} weight={'500'}>
            {review.author}
          </Paragraph>
          <Paragraph color={'gray'} size={14}>
            {dayjs(review.date).format('DD.MM.YYYY')}
          </Paragraph>
        </View>

        <Rating
          paragraphProps={{size: 14}}
          starSize={22}
          rating={review.mark}
        />
        <Paragraph size={16} color={'gray'}>
          {review.review}
        </Paragraph>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: 10}}>
          {review.images.map((image, index) => (
            <CustomImage
              key={`${image}-${index}`}
              style={{borderRadius: 10}}
              uri={image}
              width={88}
              height={120}
            />
          ))}
        </ScrollView>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{gap: 10}}>
            <TouchableOpacity onPress={() => setIsAnswer(prev => !prev)}>
              <Paragraph color={'background'}>{leave_answer}</Paragraph>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAnswersMinimized(prev => !prev)}>
              <Paragraph color={'background'}>1 comment</Paragraph>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center" style={{gap: 10}}>
            <TouchableOpacity
              className="flex-row items-center"
              style={{gap: 10}}>
              <Like />
              <Paragraph color={'gray'}>10</Paragraph>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center"
              style={{gap: 10}}>
              <View style={{transform: [{rotate: '180deg'}]}}>
                <Like />
              </View>
              <Paragraph color={'gray'}>10</Paragraph>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* answer section */}
      {answersMinimized
        ? review.answers.slice(0, 1).map(answer => renderAnswer(answer))
        : review.answers.map(answer => renderAnswer(answer))}
      {answersMinimized && (
        <TouchableOpacity onPress={() => setAnswersMinimized(false)}>
          <Paragraph color={'background'}>Show all answers</Paragraph>
        </TouchableOpacity>
      )}
      {/* answer input */}
      {isAnswer && (
        <View
          className={'flex-row items-center justify-between'}
          style={{gap: 10}}>
          <View style={{flex: 1}}>
            <TextInput
              value={answerText}
              onChangeText={setAnswerText}
              placeholder={'Your comment to the review'}
              placeholderTextColor={'#B0BCCE'}
              style={{
                height: 44,
                borderWidth: 1,
                borderColor: '#C4C6CA',
                borderRadius: 22,
                paddingHorizontal: 16,
                fontSize: 14,
              }}
            />
          </View>
          <TouchableOpacity onPress={handleSubmitAnswer} activeOpacity={0.7}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#EEEFF0',
              }}>
              <Paragraph size={18} color={'gray'}>
                ↑
              </Paragraph>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default UserReview;
