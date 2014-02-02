class RemoveNameFromPhotos < ActiveRecord::Migration
  def up
    remove_column :photos, :name
      end

  def down
    add_column :photos, :name, :string
  end
end
