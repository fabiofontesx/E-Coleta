import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { TileLayer, Marker, Map } from 'react-leaflet';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import './styles.css';

import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';

import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface IBGEUFResponse {
  id: number,
  sigla: string
}


interface IBGEDistritoResponse {
  id: number,
  nome: string
}


//Estado de array ou objeto: Manualmente informar o tipo de variavel
const CreatePoint: React.FC = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>('0');
  const [cities, setCities] = useState<IBGEDistritoResponse[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialLocation, setInitialLocation] = useState<[number, number]>([0, 0]);
  const [inputData, setInputData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [selectedFile, setSelectedFile] = useState<File>();

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const history = useHistory();

  useEffect(() => {
    api.get('/items')
      .then(response => {
        setItems(response.data);
      })
      .catch(err => {
        alert("Erro ao buscar items");
      })
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    api.get<IBGEDistritoResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
      .then(response => {
        setCities(response.data);
      })
      .catch(err => alert("Erro ao buscar as cidades"))
  }, [selectedUf])

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        setUfs(response.data);
      })
      .catch(err => {
        alert("Errp ao buscar UFS")
      })
  }, [])


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      console.log(position.coords);
      setInitialLocation([latitude, longitude]);
    }, error => {
      alert("Erro ao buscar localização atual")
    }, { enableHighAccuracy: true });
  }, []);



  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }


  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setInputData({
      ...inputData,
      [name]: value
    });
  }

  function handleSelectedItem(id: number) {
    if (selectedItems.includes(id)) {
      const removeSelectedItem = selectedItems.filter(itemId => itemId !== id);
      setSelectedItems(removeSelectedItem);
      return;
    }
    setSelectedItems([...selectedItems, id]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = inputData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    if(selectedFile){
      data.append('image', selectedFile);
    }

    try {
      await api.post('points', data);
      alert("Ponto de coleta cadastrado");
      history.push('/');
    } catch (error) {
      alert("Erro ao cadastrar ponto de coleta");
    }
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ecoleta" />
        <Link to="/" >
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>

        <Dropzone
          onFileUploaded={setSelectedFile}
        />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">

            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                onChange={handleInputChange}
              />
            </div>

          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map
            center={initialLocation}
            zoom={15}
            onClick={handleMapClick}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf"> Estado (UF) </label>
              <select
                name="uf"
                id="uf"
                onChange={handleSelectUf}
                value={selectedUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option
                    key={uf.id}
                    value={uf.sigla}
                  >
                    {uf.sigla}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city"> Cidade</label>
              <select
                name="city"
                id="city"
                onChange={handleSelectCity}
                value={selectedCity}
              >
                <option value="0"> Selecione uma cidade </option>
                {cities.map(city => (
                  <option
                    key={city.id}
                    value={city.nome}
                  >
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelectedItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt="Teste" />
                <span>{item.title}</span>
              </li>
            ))}

          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>

    </div>
  );
}

export default CreatePoint;