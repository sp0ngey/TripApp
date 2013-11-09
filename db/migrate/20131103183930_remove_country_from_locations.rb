class RemoveCountryFromLocations < ActiveRecord::Migration
  def up
    remove_column :locations, :country
  end

  def down
    add_column :locations, :country, :string
  end
end