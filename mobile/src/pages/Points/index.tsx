import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';

import api from '../../services/api';

interface Items {
  id: number,
  title: string,
  image_url: string
}

interface Point {
  id: number,
  image: string,
  image_url: string,
  name: string,
  latitude: number,
  longitude: number,
}

interface Params {
  uf: string,
  city: string
}

const Points: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [items, setItems] = useState<Items[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [points, setPoints] = useState<Point[]>([]);

  const routeParams = route.params as Params;
  useEffect(() => {
    async function loadPosition() {
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização');
        return;
      }

      const location = await getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      setInitialPosition([latitude, longitude]);
    }

    loadPosition();
  }, []);


  useEffect(() => {
    api.get('points', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItems.join(',')
      }
    }).then(response => {
      setPoints(response.data);
    })
  }, [selectedItems]);

  useEffect(() => {
    api.get<Items[]>('items')
      .then(response => {
        setItems(response.data);
      });

  }, [])

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handeNavigateToDetail(id: number) {
    navigation.navigate('Detail', { point_id: id });
  }

  function handleSelectItem(id: number) {
    if (selectedItems.includes(id)) {
      const filteredItems = selectedItems.filter(itemId => itemId !== id);
      setSelectedItems(filteredItems);
      return;
    }

    setSelectedItems([...selectedItems, id]);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>
        <Text style={styles.title}>Bem Vindo</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                longitudeDelta: 0.014,
                latitudeDelta: 0.014
              }}>


              {points.map(point => (
                <Marker
                  style={styles.mapMarker}
                  key={String(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}

                  onPress={() => handeNavigateToDetail(point.id)}
                >

                  <View style={styles.mapContainer}>
                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                    <Text style={styles.mapMarkerTitle}>Mercado</Text>
                  </View>
                </Marker>
              ))}

            </MapView>
          )}

        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map(item => (
            <TouchableOpacity
              style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]}
              key={String(item.id)}
              activeOpacity={0.5}
              onPress={() => handleSelectItem(item.id)}
            >
              <SvgUri uri={item.image_url} width={42} height={42} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}

        </ScrollView>

      </View>
    </SafeAreaView>


  );
}

export default Points;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    backgroundColor: '#34CB79',
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});