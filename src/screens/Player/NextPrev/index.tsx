import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { setRepeatMode, setShuffleMode } from 'react-native-track-player';
import Animated, {
  interpolate,
  useDerivedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { ITrack } from 'src/interfaces';
import { usePlaylist, usePlayer } from 'src/provider';

import { useAnimation } from '../Context';

import { Item } from './Item';

import { NativeEventEmitter, NativeModules } from 'react-native';
import {
  play,
  pause,
  seekTo,
  skip,
  addEventListener,
  getState,
  STATE_READY,
  STATE_PLAYING,
} from 'react-native-track-player';
import { FancyAlert } from 'react-native-expo-fancy-alerts';

interface Props {}

export const NextPrev: React.FC<Props> = () => {
  const { track } = usePlayer();
  const { active, lists, tracks, updateTrackPlayer } = usePlaylist();

  const { percent } = useAnimation();

  const [next, setNext] = useState<ITrack | null>(null);
  const [previous, setPrevious] = useState<ITrack | null>(null);

  const opacity = useDerivedValue(() => {
    return interpolate(percent.value, [90, 100], [0, 1]);
  });

  const style = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  async function onPress(id: string, playlistIndex: number) {
    if (active !== playlistIndex) {
      await updateTrackPlayer(playlistIndex);
    }

    // get state before skip
    const state = await getState();

    await skip(id);

    // If it can't be played, wait until it's ready and then play
    if (state !== STATE_PLAYING) {
      let subscription = addEventListener('playback-state', (data) => {
        if (data.state === STATE_READY) {
          play();

          subscription.remove();
        }
      });
    }
  }

  useEffect(() => {
    if (track && lists && lists[active]) {
      const activeList = lists[active].items;
      const currentIndex = activeList.indexOf(track.id);

      if (currentIndex >= 0) {
        const previousIndex = currentIndex - 1;
        const nextIndex = currentIndex + 1;

        if (previousIndex >= 0) {
          const id = activeList[previousIndex];

          if (id) {
            setPrevious(tracks.find((item) => item.id == id) ?? null);
          }
        } else {
          setPrevious(null);
        }

        if (nextIndex >= 0 && nextIndex < activeList.length) {
          const id = activeList[nextIndex];

          if (id) {
            setNext(tracks.find((item) => item.id == id) ?? null);
          }
        } else {
          setNext(null);
        }
      }
    }
  }, [track, active, lists]);

  const onPressNext = () => {
    TrackPlayer.skipToNext();
  };

  const onPressPrevious = () => {
    TrackPlayer.skipToPrevious();
  }; 

  const [visible, setVisible] = React.useState(false);
  const visibleAlert = React.useCallback(() => {
    setVisible(true);
  }, [visible]);
  const invisibleAlert = React.useCallback(() => {
    setVisible(false);
  }, [visible]);
  const { AlanEventEmitter } = NativeModules;
  const alanEventEmitter = new NativeEventEmitter(AlanEventEmitter);
  useEffect(() => {
    alanEventEmitter.addListener('onCommand', (data) => {
      if (data.command == 'onNext') {
        onPressNext();
      } else if (data.command == 'onPrevious') {
        onPressPrevious();
      } else if (data.command == 'onPause') {
        pause();
      } else if (data.command == 'onPlay') {
        play();
      } else if (data.command == 'onReplay') {
        seekTo(0);
      } else if (data.command == 'onOpen') {
        switch (data.name) {
          case 'Precious': {
            onPress('1', 0);
            break;
          }
          case 'Forget Me Now': {
            onPress('2', 0);
            break;
          }
          default:
            break;
        }
      } else if (data.command == 'onHelp') {
        visibleAlert();
      }
    });
  }, []);
  return (
    <Animated.View style={[styles.container, style]}>
      {next && <Item {...next} onPress={onPressNext} />}
      {previous && <Item {...previous} onPress={onPressPrevious} />}
      <View>
        <FancyAlert
          visible={visible}
          icon={
            <View
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FD4579',
                borderRadius: 50,
                width: '100%',
              }}></View>
          }
          style={{ backgroundColor: 'white' }}
          onRequestClose={function (): void {
            throw new Error('Function not implemented.');
          }}>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Open + Tên bài hát: Phát bài hát 
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            to Next: Chuyển sang bài hát tiếp theo
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Previous: Quay về bài hát phía trước
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Play: Tiếp tục phát
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Replay: Phát lại từ đầu
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Pause: Tạm dừng
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Enable shuffle: Bật phát ngẫu nhiên
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Disable shuffle: Tắt phát ngẫu nhiên
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Enable repeat: Bật chế độ lặp lại
          </Text>
          <Text style={{ marginTop: -16, marginBottom: 32, fontWeight: '900' }}>
            Disable repeat: Tắt chế độ lặp lại
          </Text>
          <Text
            style={{
              marginTop: -16,
              marginBottom: 32,
              color: '#FD4579',
              fontWeight: '900',
              fontSize: 30,
            }}
            onPress={invisibleAlert}>
            OK
          </Text>
        </FancyAlert>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 150,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
