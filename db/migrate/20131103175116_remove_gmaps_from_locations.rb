class RemoveGmapsFromLocations < ActiveRecord::Migration
  def up
    remove_column :locations, :gmaps
      end

  def down
    add_column :locations, :gmaps, :boolean
  end
end
