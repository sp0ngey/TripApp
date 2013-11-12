require 'test_helper'

class TripItemsControllerTest < ActionController::TestCase
  setup do
    @trip_item = trip_items(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:trip_items)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create trip_item" do
    assert_difference('TripItem.count') do
      post :create, trip_item: @trip_item.attributes
    end

    assert_redirected_to trip_item_path(assigns(:trip_item))
  end

  test "should show trip_item" do
    get :show, id: @trip_item
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @trip_item
    assert_response :success
  end

  test "should update trip_item" do
    put :update, id: @trip_item, trip_item: @trip_item.attributes
    assert_redirected_to trip_item_path(assigns(:trip_item))
  end

  test "should destroy trip_item" do
    assert_difference('TripItem.count', -1) do
      delete :destroy, id: @trip_item
    end

    assert_redirected_to trip_items_path
  end
end
