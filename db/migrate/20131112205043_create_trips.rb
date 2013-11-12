class CreateTrips < ActiveRecord::Migration
  def change
    create_table :trips do |t|
      t.string :name
      t.text :description
      t.integer :up_vote
      t.integer :down_vote
      t.boolean :published
      t.boolean :my_trip
      t.integer :user_id

      t.timestamps
    end
  end
end
