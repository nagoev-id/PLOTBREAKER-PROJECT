import * as migration_20260217_091440_add_collections from './20260217_091440_add_collections';
import * as migration_20260217_103456_add_kp_rating from './20260217_103456_add_kp_rating';
import * as migration_20260217_124700_seed_collections from './20260217_124700_seed_collections';

export const migrations = [
  {
    up: migration_20260217_091440_add_collections.up,
    down: migration_20260217_091440_add_collections.down,
    name: '20260217_091440_add_collections',
  },
  {
    up: migration_20260217_103456_add_kp_rating.up,
    down: migration_20260217_103456_add_kp_rating.down,
    name: '20260217_103456_add_kp_rating',
  },
  {
    up: migration_20260217_124700_seed_collections.up,
    down: migration_20260217_124700_seed_collections.down,
    name: '20260217_124700_seed_collections'
  },
];
