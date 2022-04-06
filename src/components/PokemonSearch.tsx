import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';
import PokemonInfo from '../types/PokemonInfo';
import isError from '../utils/castError';

const PokemonSearch = () => {
  const [pokemon, setPokemon] = useState<string>('');

  return (
    <>
      <input value={pokemon} onChange={(e) => setPokemon(e.target.value)} />
      <br />
      <PokemonSearchResults pokemon={pokemon} />
    </>
  );
};

export default PokemonSearch;

const PokemonSearchResults = ({ pokemon }: { pokemon: string }) => {
  // should probably debounce this
  const queryInfo = useQuery<PokemonInfo>(
    ['pokemon', pokemon],
    async () => {
      const source = axios.CancelToken.source();

      // TODO don't cast to any - but promise.cancel complains by default
      const promise: any = axios
        .get(`http://pokeapi.co/api/v2/pokemon/${pokemon}`, {
          cancelToken: source.token,
        })
        .then((res) => res.data);

      promise.cancel = () => {
        source.cancel('Query was cancelled by React Query');
      };

      return promise;
    },
    {
      // Default is 3
      // each retry waits longer than the one before by default
      retry: 1,
      // How long to wait between retries
      // Can give a number (ms) or a function, for example in this case exponential or 30s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // only run if 'pokemon' is truthy
      enabled: pokemon !== '',
    }
  );

  if (pokemon === '') return <div>type name to search</div>;
  if (queryInfo.isError && isError(queryInfo.error))
    return <div>{queryInfo.error.message}</div>;
  if (queryInfo.isFetching) return <div>Fetching</div>;
  if (!queryInfo.data?.sprites?.front_default)
    return <div>Pokemon '{pokemon}' not found</div>;
  return <img src={queryInfo.data.sprites.front_default} alt={pokemon} />;
};
