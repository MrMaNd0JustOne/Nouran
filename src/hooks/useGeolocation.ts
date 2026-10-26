import { useState, useEffect, useCallback } from 'react';
import { LocationState, CityOption } from '../types/prayer';
import { DEFAULT_LOCATION, fetchCityCountryName } from '../services/prayerApi';

const SAVED_LOCATION_KEY = 'nouran_saved_location';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>(() => {
    try {
      const saved = localStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      cityName: DEFAULT_LOCATION.cityName,
      countryName: DEFAULT_LOCATION.countryName,
      isManual: true,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  // Check initial permission status if supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          result.onchange = () => {
            setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {
          // ignore
        });
    }
  }, []);

  // Request actual Geolocation from device
  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('جهازك أو متصفحك لا يدعم تحديد الموقع الجغرافي');
      setPermissionStatus('unsupported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPermissionStatus('granted');

          // Fetch city name via Nominatim reverse geocoding
          const { cityName, countryName } = await fetchCityCountryName(lat, lng);

          const newLocation: LocationState = {
            latitude: lat,
            longitude: lng,
            cityName: cityName || 'موقعي الحالي',
            countryName: countryName || '',
            isManual: false,
          };

          setLocation(newLocation);
          try {
            localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(newLocation));
          } catch {
            // ignore
          }

          setIsLoading(false);
          resolve(true);
        },
        (err) => {
          setIsLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            setError('تم رفض إذن تحديد الموقع. تم الاعتماد على الموقع الافتراضي، ويمكنك اختيار مدينتك يدوياً.');
          } else {
            setError('تعذر تحديد موقعك الحالي بدقة، يمكنك اختيار مدينتك يدوياً.');
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 600000, // 10 minutes cache
        }
      );
    });
  }, []);

  // Set location manually from predefined cities or custom
  const setManualLocation = useCallback((city: CityOption) => {
    const newLocation: LocationState = {
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.cityName,
      countryName: city.countryName,
      isManual: true,
    };
    setLocation(newLocation);
    setError(null);
    try {
      localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(newLocation));
    } catch {
      // ignore
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestLocation,
    setManualLocation,
  };
}
