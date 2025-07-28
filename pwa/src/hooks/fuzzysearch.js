import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

const useFuzzySearch = (data = [], options = {}) => {
  const [results, setResults] = useState(data);

  const fuse = useMemo(() => {
    return new Fuse(data, options)
  }, [data, options]);

  const search = useCallback((query = '') => {
    if (query !== '') {
      const searchResults = fuse.search(query);
      const newResults = searchResults.map(result => result.item)
      console.log(query, newResults)
      setResults(newResults)
    } else {
      console.log('Are you kiding me')
      setResults(data)
    }

  }, [fuse, data])

  return { results, search };
};

export default useFuzzySearch;
