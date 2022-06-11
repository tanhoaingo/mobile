import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from 'src/constants';

import { Playlist } from './Playlist';
import { Player } from './Player';

const { AlanView } = require('@alan-ai/alan-sdk-react-native');

export const Screens = () => {


  return (
    <View style={styles.container}>
      <Playlist />
      <Player />
      <AlanView projectid={'3d9f6d7d80947a2224611c4565deb1432e956eca572e1d8b807a3e2338fdd0dc/stage'}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
