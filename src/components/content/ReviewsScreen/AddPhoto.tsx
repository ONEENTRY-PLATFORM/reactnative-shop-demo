import {View, Text, Pressable, TouchableOpacity, Alert} from 'react-native';
import React, {useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import CameraIcon from '../../../assets/icons/Camera.svg';
import {Paragraph} from '../../ui/texts/Paragraph';
import CustomImage from '../../ui/templates/CustomImage';
import {useAppSelector} from '../../../state/hooks';
import {ScrollView} from 'react-native-gesture-handler';

interface AddPhotoProps {
  images?: string[];
  onImagesChange?: (images: string[]) => void;
}

const ArrayOfImages = Array.from({length: 5});

export default function AddPhoto({
  images: externalImages,
  onImagesChange,
}: AddPhotoProps) {
  const [images, setImages] = useState<string[]>(externalImages || []);
  const {
    add_photos,
    select_source,
    select_source_description,
    camera_title,
    gallery_title,
    permissions_required,
  } = useAppSelector(state => state.systemContentReducer.content);

  const updateImages = (newImages: string[]) => {
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const requestPermissions = async (option: 'camera' | 'gallery') => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      option === 'camera'
        ? cameraPermission.status !== 'granted'
        : mediaLibraryPermission.status !== 'granted'
    ) {
      Alert.alert(permissions_required, '', [{text: 'OK'}]);
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      select_source,
      select_source_description,
      [
        {
          text: camera_title,
          onPress: () => pickImage('camera'),
        },
        {
          text: gallery_title,
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const hasPermissions = await requestPermissions(source);
    if (!hasPermissions) return;

    try {
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          allowsMultipleSelection: false,
        });
      }

      if (!result.canceled && result.assets[0] && images.length < 5) {
        const newImages = [...images, result.assets[0].uri];
        updateImages(newImages);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load image');
      console.error('Image picker error:', error);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateImages(newImages);
  };

  const renderImage = (index: number) => {
    const hasImage = images[index];
    const canAddMore = images.length < 5;

    const onPress = () => {
      showImagePickerOptions();
    };

    return (
      <TouchableOpacity
        key={index}
        onPress={onPress}
        className="h-[120px] w-[88px] rounded-md border-sm border-gray items-center justify-center"
        disabled={!hasImage && !canAddMore}>
        {!hasImage ? (
          <CameraIcon />
        ) : (
          <View className="relative rounded-sm">
            <CustomImage
              style={{borderRadius: 10}}
              uri={images[index]}
              width={80}
              height={80}
            />
            <TouchableOpacity
              hitSlop={10}
              onPress={() => removeImage(index)}
              className="absolute right-0 top-0 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">×</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 10}}>
        {ArrayOfImages.map((image, index) => renderImage(index))}
      </ScrollView>
    </View>
  );
}
