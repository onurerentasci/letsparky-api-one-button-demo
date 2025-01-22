import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const statuses = [
  { 
    code: 'UNBLOCK', 
    description: 'Op_Status is GUARDING',
    image: require('../../assets/images/console_boucner_active_down.png'),
    color: '#f7aa14'
  },
  { 
    code: 'BLOCK', 
    description: 'Op_Status is READY_TO_PARK',
    image: require('../../assets/images/console_bouncer_active_up.png'),
    color: '#f7aa14'
  },
  { 
    code: 'NO COMMAND', 
    description: 'Op_Status status is ONGOING_PARKING',
    image: require('../../assets/images/console_bouncer_in_use.png'),
    color: '#808080'
  },
  { 
    code: 'MUTE', 
    description: 'Op_Status is ALARM',
    image: require('../../assets/images/console_bouncer_alarm.png'),
    color: '#e43434'
  },
  { 
    code: 'OFFLINE', 
    description: 'NO COMMAND',
    image: require('../../assets/images/console_bouncer_passive.png'),
    color: '#808080'
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
    outputRange: [0, 480],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.headerContainer} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Operational Commands</Text>
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
          <View key={status.code} style={[styles.button, { backgroundColor: status.color }]}>
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 64,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
    minWidth: 280,
    justifyContent: 'flex-start',
    height: 80,
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
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
});
