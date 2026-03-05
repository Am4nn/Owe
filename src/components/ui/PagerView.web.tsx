import React, { forwardRef } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

const PagerView = forwardRef(({ children, onPageSelected, ...props }: any, ref: any) => {
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const x = e.nativeEvent.contentOffset.x;
        const w = e.nativeEvent.layoutMeasurement.width;
        if (w > 0 && onPageSelected) {
          const position = Math.round(x / w);
          onPageSelected({ nativeEvent: { position } });
        }
      }}
      ref={ref}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <View style={{ width }}>{child}</View>
      ))}
    </ScrollView>
  );
});

export default PagerView;
