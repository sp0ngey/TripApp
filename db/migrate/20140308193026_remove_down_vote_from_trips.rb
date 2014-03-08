class RemoveDownVoteFromTrips < ActiveRecord::Migration
  def up
    remove_column :trips, :down_vote
      end

  def down
    add_column :trips, :down_vote, :integer
  end
end
