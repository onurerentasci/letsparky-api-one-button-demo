import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const statuses = [
  { 
    code: 'GUARDING', 
    description: 'Device is blocked (BLOCKED)',
    image: require('../../assets/images/console_boucner_active_down.png')
  },
  { 
    code: 'READY_TO_PARK', 
    description: 'Device is unblocked (UNBLOCKED)',
    image: require('../../assets/images/console_bouncer_active_up.png')
  },
  { 
    code: 'ONGOING_PARKING', 
    description: 'Parking operation in progress',
    image: require('../../assets/images/console_bouncer_in_use.png')
  },
  { 
    code: 'ALARM', 
    description: 'Device is in alarm state',
    image: require('../../assets/images/console_bouncer_alarm.png')
  },
  { 
    code: 'OFFLINE', 
    description: 'Device is offline',
    image: require('../../assets/images/console_bouncer_passive.png')
  },
];

export const OperationalStatusGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 380],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.headerContainer} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Operational Status Guide</Text>
        <Animated.View style={[
          styles.chevronContainer,
          {
            transform: [{
              rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              })
            }]
          }
        ]}>
          <AntDesign name="down" size={24} color="#333" />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View style={[
        styles.contentContainer,
        { height: heightInterpolate, overflow: 'hidden' }
      ]}>
        {statuses.map((status) => (
          <View key={status.code} style={styles.button}>
            <Image source={status.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>{status.code}</Text>
              <Text style={styles.description}>{status.description}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    height: 40,
  },
  contentContainer: {
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chevronContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 2,
  },
  button: {
    backgroundColor: '#F8AB16',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 64,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
    minWidth: 280,
    justifyContent: 'flex-start',
    height: 56,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  image: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
});
