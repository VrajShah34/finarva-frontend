import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RootStackParamList = {
  DailyGoal: undefined;
  CourseDetail: { id: string };
};

type DailyGoalScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'DailyGoal'>;
};

const DailyGoalScreen: React.FC<DailyGoalScreenProps> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  
  // All animations will use JavaScript driver (not native driver)
  const containerHeight = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef<{ [key: string]: Animated.Value[] }>({}).current;
  
  const [courses, setCourses] = useState([
    {
      id: '1',
      title: 'Selling Health Insurance with Empathy',
      description: 'Learn how to manage fear, build rapport fast, and understand emotional triggers.',
      completed: true,
      image: require('../assets/images/react-logo.png'),
      steps: ['1', '2']
    },
    {
      id: '2',
      title: 'Mastering Cold Calls: From Nervous to Natural',
      description: 'Understand what goes on in the mind of a potential lead during the first few seconds and how to respond effectively.',
      completed: false,
      image: require('../assets/images/react-logo.png'),
      steps: ['3', '4']
    },
    {
      id: '3',
      title: 'Advanced Negotiation Techniques',
      description: 'Learn to navigate complex pricing discussions and close more deals with confidence.',
      completed: false,
      image: require('../assets/images/react-logo.png'),
      steps: ['5', '6']
    },
  ]);
  
  const learningSteps = [
    {
      id: '1',
      title: 'The Psychology of a Cold Call',
      completed: true,
      xp: '20 XP',
      step: 1,
      courseId: '1'
    },
    {
      id: '2',
      title: 'Perfecting Your 15-Second Pitch',
      completed: false,
      xp: '500 XP',
      step: 2,
      courseId: '1'
    },
    {
      id: '3',
      title: 'Handling "Not Interested" with Grace',
      completed: false,
      xp: 'Discover polite yet strategic responses',
      step: 3,
      courseId: '2'
    },
    {
      id: '4',
      title: 'Closing Calls with Confidence',
      completed: false,
      xp: 'End your conversations with clear next steps',
      step: 3,
      courseId: '2'
    },
  ];
  
  // Initialize animation values for each step
  useEffect(() => {
    learningSteps.forEach(step => {
      if (!itemAnimations[step.id]) {
        // For each step, we'll track opacity and translateY separately
        itemAnimations[step.id] = [
          new Animated.Value(0), // opacity
          new Animated.Value(20)  // translateY
        ];
      }
    });
  }, []);
  
  const toggleCourseExpansion = (courseId: string) => {
    const steps = getCourseSteps(courseId);
    
    // If we're closing this course
    if (expandedCourseId === courseId) {
      // Collapse animation
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false, // Must be false for consistency
        }),
        Animated.timing(containerHeight, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        ...steps.flatMap(step => {
          if (!itemAnimations[step.id]) {
            itemAnimations[step.id] = [new Animated.Value(0), new Animated.Value(20)];
          }
          return [
            // Animate opacity
            Animated.timing(itemAnimations[step.id][0], {
              toValue: 0,
              duration: 200,
              delay: 50 * (steps.length - steps.indexOf(step) - 1), // Items disappear in reverse order
              useNativeDriver: false,
            }),
            // Animate translateY
            Animated.timing(itemAnimations[step.id][1], {
              toValue: 20,
              duration: 200,
              delay: 50 * (steps.length - steps.indexOf(step) - 1),
              useNativeDriver: false,
            })
          ];
        }).flat()
      ]).start(() => {
        setExpandedCourseId(null);
      });
    } 
    // If we're opening a new course
    else {
      // Reset animation values
      containerHeight.setValue(0);
      containerOpacity.setValue(0);
      
      // Create and reset animation values for each step
      steps.forEach((step) => {
        if (!itemAnimations[step.id]) {
          itemAnimations[step.id] = [new Animated.Value(0), new Animated.Value(20)];
        } else {
          itemAnimations[step.id][0].setValue(0); // opacity
          itemAnimations[step.id][1].setValue(20); // translateY
        }
      });
      
      setExpandedCourseId(courseId);
      
      // Run expand animations after state is updated
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(containerHeight, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(containerOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          ...steps.flatMap((step, index) => [
            // Animate opacity
            Animated.timing(itemAnimations[step.id][0], {
              toValue: 1,
              duration: 400,
              delay: 100 + (100 * index), // Staggered animation
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }),
            // Animate translateY
            Animated.timing(itemAnimations[step.id][1], {
              toValue: 0,
              duration: 400,
              delay: 100 + (100 * index),
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            })
          ]).flat()
        ]).start();
        
        // Scroll to make expanded card visible after animation
        setTimeout(() => {
          scrollViewRef.current?.flashScrollIndicators();
        }, 500);
      }, 50);
    }
  };
  
  const getCourseSteps = (courseId: string) => {
    return learningSteps.filter(step => step.courseId === courseId);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1E4B88]">
      <StatusBar barStyle="light-content" backgroundColor="#1E4B88" />
      
      {/* Background gradient for more visual appeal */}
      <LinearGradient
        colors={['rgba(30, 75, 136, 1)', 'rgba(26, 54, 93, 1)']}
        className="absolute h-full w-full"
      />
      
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header with Profile - Enhanced with subtle shadows */}
        <View className="flex-row items-center justify-between px-5 pt-10">
          <View className="flex-row items-center pt-3">
            <View className="shadow-md rounded-full">
              <Image
                source={require('../assets/images/react-logo.png')}
                className="w-12 h-12 rounded-full border-2 border-white/20"
              />
            </View>
            <Text className="text-white text-lg font-bold ml-3 text-shadow">Hi Ramesh!</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-5 bg-[#1A365D]/30 py-1 px-3 rounded-full">
              <Icon name="heart" size={22} color="#FF4D67" />
              <Text className="text-white ml-1.5 font-medium">5</Text>
            </View>
            <View className="flex-row items-center bg-[#1A365D]/30 py-1 px-3 rounded-full">
              <Icon name="lightning-bolt" size={20} color="#FFA726" />
              <Text className="text-white ml-1.5 font-medium">680</Text>
            </View>
          </View>
        </View>
        
        {/* Daily Goal Card - Enhanced with better shadows and padding */}
        <View className="mx-4 my-6">
          <View className="bg-[#FFE4E4] rounded-2xl p-5 shadow-lg">
            <Text className="text-center text-[#555] text-lg font-semibold tracking-wide uppercase mb-3">YOUR DAILY GOAL</Text>
            
            <View className="flex-row">
              <View className="mr-4 items-center justify-center">
                <Image 
                  source={require('../assets/images/react-logo.png')}
                  className="w-16 h-16 rounded-lg shadow-sm"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#333] text-xl font-bold mb-1">Stay focused. Build consistency.</Text>
                <Text className="text-[#777] text-base leading-5">
                  Set your personalized sales or learning goal each morning — whether it&apos;s completing 3 calls, qualifying 2 leads.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text className="text-white text-lg font-medium ml-5 mb-4">
          Here is a personalized learning plan for you
        </Text>
        
        {/* Course Cards - Enhanced with animations and better visual hierarchy */}
        {courses.map((course) => {
          const steps = getCourseSteps(course.id);
          const maxHeight = steps.length * 68 + 100; // Approximate height of each step item + space for button
          
          return (
            <View key={course.id} className="mx-4 mb-5">
              <TouchableOpacity
                activeOpacity={0.9}
                className={`${course.completed ? 'bg-[#4DF0A9]' : 'bg-[#4DF0C2]'} rounded-2xl p-5 shadow-md`}
                onPress={() => toggleCourseExpansion(course.id)}
              >
                <View className="flex-row justify-between">
                  <View className="flex-1 pr-2">
                    {course.completed && (
                      <View className="flex-row items-center mb-2">
                        <View className="bg-white h-7 w-7 rounded-full justify-center items-center shadow-sm">
                          <Icon name="check" size={18} color="#4DF0A9" />
                        </View>
                        <Text className="text-[#005E36] ml-2 font-medium">Completed</Text>
                      </View>
                    )}
                    
                    <Text className="text-[#005E36] text-2xl font-bold mb-2">{course.title}</Text>
                    <Text className="text-[#005E36] text-base opacity-80">{course.description}</Text>
                    
                    {/* Indicator to show card is expandable */}
                    <View className="flex-row items-center mt-3">
                      <Text className="text-[#005E36] font-medium mr-1">
                        {expandedCourseId === course.id ? 'Hide steps' : 'Show steps'}
                      </Text>
                      <Icon 
                        name={expandedCourseId === course.id ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#005E36" 
                      />
                    </View>
                  </View>
                  
                  <Image 
                    source={course.image}
                    className="h-24 w-16 rounded-lg shadow-sm"
                  />
                </View>
              </TouchableOpacity>
              
              {/* Animated container for expanded steps */}
              {expandedCourseId === course.id && (
                <Animated.View 
                  style={{
                    opacity: containerOpacity,
                    maxHeight: containerHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, maxHeight]
                    }),
                    transform: [{
                      translateY: containerOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      })
                    }]
                  }}
                  className="mt-2 bg-white/10 rounded-xl overflow-hidden"
                >
                  {steps.map((step) => (
                    <Animated.View 
                      key={step.id} 
                      style={{
                        opacity: itemAnimations[step.id] ? itemAnimations[step.id][0] : 0,
                        transform: [{
                          translateY: itemAnimations[step.id] ? itemAnimations[step.id][1] : 20
                        }]
                      }}
                      className="flex-row items-center p-4 border-b border-white/10"
                    >
                      <View className={`h-10 w-10 rounded-full ${step.completed ? 'bg-[#4DF0A9]' : 'bg-[#D9D9D9]/70'} justify-center items-center shadow-sm`}>
                        {step.completed ? (
                          <Icon name="check" size={20} color="white" />
                        ) : (
                          <Text className="text-white text-base font-bold">{step.step}</Text>
                        )}
                      </View>
                      
                      <View className="ml-3 flex-1">
                        <Text className={`text-base ${step.completed ? 'text-[#4DF0A9]' : 'text-white'} font-bold`}>
                          {step.title}
                        </Text>
                        <Text className="text-[#B8C5D9] text-sm">{step.xp}</Text>
                      </View>
                      
                      <TouchableOpacity 
                        className="bg-[#1A365D]/50 h-8 w-8 rounded-full justify-center items-center"
                        onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                      >
                        <Icon name="play" size={16} color="white" />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                  
                  {/* Start Course Button - Animated separately for extra effect */}
                  <Animated.View
                    style={{
                      opacity: containerOpacity,
                      transform: [{
                        translateY: containerOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0]
                        })
                      }]
                    }}
                  >
                    <TouchableOpacity 
                      className="bg-[#1A365D]/70 m-4 py-3 px-4 rounded-xl flex-row justify-center items-center"
                      onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                    >
                      <Icon name="book-open-variant" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">Start Course</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              )}
            </View>
          );
        })}
        
        {/* Added recommended courses section */}
        <View className="mt-4 pb-6">
          <Text className="text-white text-lg font-medium ml-5 mb-4">
            Recommended For You
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            className="pb-2"
          >
            {[
              { 
                id: 'rec1', 
                title: 'Objection Handling Mastery', 
                duration: '45 min',
                image: require('../assets/images/react-logo.png')
              },
              { 
                id: 'rec2', 
                title: 'Building Client Trust', 
                duration: '30 min',
                image: require('../assets/images/react-logo.png') 
              },
              { 
                id: 'rec3', 
                title: 'Effective Follow-up Techniques', 
                duration: '20 min',
                image: require('../assets/images/react-logo.png') 
              }
            ].map((item) => (
              <TouchableOpacity 
                key={item.id}
                className="bg-[#1A365D]/60 rounded-xl mr-4 w-56 overflow-hidden"
                onPress={() => console.log('Navigate to recommended course')}
              >
                <Image 
                  source={item.image}
                  className="h-28 w-full"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <Text className="text-white font-bold text-base">{item.title}</Text>
                  <View className="flex-row items-center mt-2">
                    <Icon name="clock-outline" size={14} color="#B8C5D9" />
                    <Text className="text-[#B8C5D9] text-xs ml-1">{item.duration}</Text>
                    <View className="bg-[#1E4B88] rounded-full py-0.5 px-2 ml-auto">
                      <Text className="text-blue-200 text-xs font-medium">NEW</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyGoalScreen;