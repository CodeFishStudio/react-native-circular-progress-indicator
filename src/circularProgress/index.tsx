import React, { useEffect } from "react";
import { StyleSheet, View, TextInput, Text } from "react-native";
import Svg, { G, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  withDelay,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import { CircularProgressProps } from "./types";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedInput = Animated.createAnimatedComponent(TextInput);

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  initialValue = 0,
  title = "",
  titleStyle = {},
  titleColor,
  titleFontSize,
  circleBackgroundColor = "transparent",
  radius = 60,
  duration = 500,
  delay = 0,
  textColor,
  textStyle = {},
  fontSize,
  maxValue = 100,
  strokeLinecap = "round",
  onAnimationComplete = () => {},
  valuePrefix = "",
  valueSuffix = "",
  activeStrokeColor = "#2ecc71",
  activeStrokeSecondaryColor = "",
  activeStrokeWidth = 10,
  inActiveStrokeColor = "rgba(0,0,0,0.3)",
  inActiveStrokeWidth = 10,
  inActiveStrokeOpacity = 1,
  showProgressValue = true,
  clockwise = true,
  subtitle = "",
  subtitleStyle = {},
  subtitleColor,
  subtitleFontSize,
  progressContainerStyle,
  valueSuffixStyle,
  valuePrefixStyle,
}) => {
  const styleProps = {
    radius,
    textColor,
    fontSize,
    textStyle,
    activeStrokeColor,
    titleStyle,
    titleColor,
    titleFontSize,
    showProgressValue,
    subtitleColor,
    subtitleFontSize,
  };

  const animatedValue = useSharedValue(initialValue);
  const viewBox = radius + Math.max(activeStrokeWidth, inActiveStrokeWidth);
  const circleCircumference = 2 * Math.PI * radius;

  const animatedCircleProps = useAnimatedProps(() => {
    let biggestValue = Math.min(100, Math.max(initialValue, maxValue));

    biggestValue = biggestValue <= 0 ? 1 : biggestValue;

    // Limit circle to 100%
    let maxPercentage: number = Math.min(100, (clockwise
      ? (100 * animatedValue.value) / biggestValue
      : (100 * -animatedValue.value) / biggestValue));

    

    // Stops tips touching prematurely
    if (maxPercentage < 100) {
        maxPercentage *= 0.97;  
    }

    return {
      strokeDashoffset:
        circleCircumference - (circleCircumference * maxPercentage) / 100,
    };
  });

  const progressValue = useDerivedValue(() => {
    return `${Math.round(animatedValue.value)}`;
  });

  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: progressValue.value,
    } as any;
  });

  useEffect(() => {
    animatedValue.value = withDelay(
      delay,
      withTiming(value, { duration }, (isFinished) => {
        if (isFinished) {
          runOnJS(onAnimationComplete)?.();
        }
      })
    );
  }, [value]);

  return (
        <View>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${viewBox * 2} ${viewBox * 2}`}
      >
        {activeStrokeSecondaryColor ? (
          <Defs>
            <LinearGradient id={"grad"} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={activeStrokeSecondaryColor} />
              <Stop offset="100%" stopColor={activeStrokeColor} />
            </LinearGradient>
          </Defs>
        ) : null}
        <G rotation={"-90"} origin={`${viewBox}, ${viewBox}`}>
          <Circle
            cx="50%"
            cy="50%"
            stroke={inActiveStrokeColor}
            strokeWidth={inActiveStrokeWidth}
            r={radius}
            fill={"transparent"}
            strokeOpacity={inActiveStrokeOpacity}
          />
          <AnimatedCircle
            cx="50%"
            cy="50%"
            stroke={
              activeStrokeSecondaryColor ? "url(#grad)" : activeStrokeColor
            }
            strokeWidth={activeStrokeWidth}
            r={radius}
            fill={circleBackgroundColor}
            strokeDasharray={circleCircumference}
            animatedProps={animatedCircleProps}
            strokeLinecap={strokeLinecap}
          />
        </G>
      </Svg>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          dynamicStyles(styleProps).valueContainer,
        ]}
      >
        {showProgressValue && (
            <View style={progressContainerStyle}>
          <Text style={valuePrefixStyle}>{valuePrefix}</Text>
          <AnimatedInput
            underlineColorAndroid={"transparent"}
            editable={false}
            defaultValue={`${initialValue}`}
            style={[
              dynamicStyles(styleProps).input,
              textStyle,
              dynamicStyles(styleProps).fromProps,
            ]}
            animatedProps={animatedTextProps}
          />
          <Text style={valueSuffixStyle}>{valueSuffix}</Text>
          </View>
        )}
        {title && title !== "" ? (
          <Text
            style={[dynamicStyles(styleProps).title, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
        {subtitle && subtitle !== "" ? (
          <Text
            style={[
              dynamicStyles(styleProps).title,
              dynamicStyles(styleProps).subtitle,
              subtitleStyle,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export const dynamicStyles = (props) => {
  return StyleSheet.create({
    fromProps: {
      fontSize: props.fontSize || props.textStyle?.fontSize || props.radius / 2,
      color:
        props.textColor || props.textStyle?.color || props.activeStrokeColor,
    },
    input: {
      fontWeight: "bold",
      textAlign: "center",
    },
    valueContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      textAlign: "center",
      width: "70%",
      marginTop: props.showProgressValue ? props.radius * 0.05 : 0,
      color:
        props.titleColor || props.titleStyle?.color || props.activeStrokeColor,
      fontSize:
        props.titleFontSize ||
        props.titleStyle?.fontSize ||
        props.fontSize ||
        props.radius / 4,
    },
    subtitle: {
      color:
        props.subtitleColor ||
        props.subtitleStyle?.color ||
        props.activeStrokeColor,
      fontSize:
        props.subtitleFontSize ||
        props.subtitleStyle?.fontSize ||
        props.fontSize ||
        props.radius / 5,
    },
  });
};

export default CircularProgress;
