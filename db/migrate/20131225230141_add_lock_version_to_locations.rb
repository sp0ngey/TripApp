#
# Adding optimistic locking to locations because this table in particular may have concurrent write actions
# due to the way locations may be shared between trips (if two trips use the same location we don't replicate it
# twice - it only appears once in the location table - database normalisation...)
#
# TODO Want to check that optimisitic locking covers creation as well as just updating
class AddLockVersionToLocations < ActiveRecord::Migration
  def self.up
    add_column :locations, :lock_version, :integer, :default => 0
  end

  def self.down
    remove_column :locations, :lock_version
  end
end
