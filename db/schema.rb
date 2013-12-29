# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20131227165213) do

  create_table "countries", :force => true do |t|
    t.string   "long_name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "country_abbreviations", :force => true do |t|
    t.string   "short_name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "identities", :force => true do |t|
    t.string   "name"
    t.string   "email"
    t.string   "password_digest"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "locations", :force => true do |t|
    t.float   "longitude"
    t.float   "latitude"
    t.string  "country"
    t.integer "lock_version",      :default => 0
    t.string  "admin_area_1"
    t.string  "admin_area_2"
    t.string  "admin_area_3"
    t.string  "formatted_address"
    t.string  "locality"
  end

  create_table "trip_items", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.date     "start_date"
    t.date     "end_date"
    t.integer  "trip_id"
    t.integer  "location_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "trips", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "up_vote"
    t.integer  "down_vote"
    t.boolean  "published"
    t.boolean  "my_trip"
    t.integer  "user_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "login_type"
    t.string   "first_name"
    t.string   "last_name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "uid"
    t.string   "name"
    t.string   "provider"
  end

end
