class CreateVotes < ActiveRecord::Migration
  def change
    create_table :votes do |t|
      t.integer :user_id, :null => false
      t.integer :trip_id, :null => false
      t.string :vote_type, :null => false

      t.timestamps
    end
  end
end
