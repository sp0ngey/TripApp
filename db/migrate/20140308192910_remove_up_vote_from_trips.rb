class RemoveUpVoteFromTrips < ActiveRecord::Migration
  def up
    remove_column :trips, :up_vote
      end

  def down
    add_column :trips, :up_vote, :integer
  end
end
