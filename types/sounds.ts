// Keyboard sound pack configuration

// Mechvibes format config.json structure
export interface MechvibesConfig {
  id: string;
  name: string;
  key_define_type: 'single' | 'multi';
  includes_numpad: boolean;
  sound: string; // main sound file
  defines: Record<string, [number, number] | string | null>; // keycode -> [offset, duration] or filename
}

export interface SoundPack {
  id: string;
  name: string;
  path: string; // folder path in public/sounds/
  configLoaded?: boolean;
  config?: MechvibesConfig;
}

// Available sound packs
export const SOUND_PACKS: SoundPack[] = [
  {
    id: 'synthetic',
    name: 'Synthetic (Built-in)',
    path: '', // empty = use Web Audio API
  },
  {
    id: 'cherrymx-black-abs',
    name: 'Cherry MX Black - ABS',
    path: '/sounds/cherrymx-black-abs',
  },
  {
    id: 'cherrymx-black-pbt',
    name: 'Cherry MX Black - PBT',
    path: '/sounds/cherrymx-black-pbt',
  },
  {
    id: 'cherrymx-blue-abs',
    name: 'Cherry MX Blue - ABS',
    path: '/sounds/cherrymx-blue-abs',
  },
  {
    id: 'cherrymx-blue-pbt',
    name: 'Cherry MX Blue - PBT',
    path: '/sounds/cherrymx-blue-pbt',
  },
  {
    id: 'cherrymx-red-abs',
    name: 'Cherry MX Red - ABS',
    path: '/sounds/cherrymx-red-abs',
  },
  {
    id: 'cherrymx-red-pbt',
    name: 'Cherry MX Red - PBT',
    path: '/sounds/cherrymx-red-pbt',
  },
  {
    id: 'cherrymx-brown-abs',
    name: 'Cherry MX Brown - ABS',
    path: '/sounds/cherrymx-brown-abs',
  },
  {
    id: 'cherrymx-brown-pbt',
    name: 'Cherry MX Brown - PBT',
    path: '/sounds/cherrymx-brown-pbt',
  },
  {
    id: 'topre-purple-hybrid-pbt',
    name: 'Topre Purple Hybrid - PBT',
    path: '/sounds/topre-purple-hybrid-pbt',
  },
  {
    id: 'eg-oreo',
    name: 'EG Oreo',
    path: '/sounds/eg-oreo',
  },
  {
    id: 'eg-crystal-purple',
    name: 'EG Crystal Purple',
    path: '/sounds/eg-crystal-purple',
  },
  {
    id: 'nk-cream',
    name: 'NK Cream',
    path: '/sounds/nk-cream',
  },
];
