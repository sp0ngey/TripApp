class TripItemsController < ApplicationController
  # GET /trip_items
  # GET /trip_items.json
  def index
    @trip_items = TripItem.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @trip_items }
    end
  end

  # GET /trip_items/1
  # GET /trip_items/1.json
  def show
    @trip_item = TripItem.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @trip_item }
    end
  end

  # GET /trip_items/new
  # GET /trip_items/new.json
  def new
    @trip_item = TripItem.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @trip_item }
    end
  end

  # GET /trip_items/1/edit
  def edit
    @trip_item = TripItem.find(params[:id])
  end

  # POST /trip_items
  # POST /trip_items.json
  def create
    @trip_item = TripItem.new(params[:trip_item])

    respond_to do |format|
      if @trip_item.save
        format.html { redirect_to @trip_item, notice: 'Trip item was successfully created.' }
        format.json { render json: @trip_item, status: :created, location: @trip_item }
      else
        format.html { render action: "new" }
        format.json { render json: @trip_item.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /trip_items/1
  # PUT /trip_items/1.json
  def update
    @trip_item = TripItem.find(params[:id])

    respond_to do |format|
      if @trip_item.update_attributes(params[:trip_item])
        format.html { redirect_to @trip_item, notice: 'Trip item was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @trip_item.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /trip_items/1
  # DELETE /trip_items/1.json
  def destroy
    @trip_item = TripItem.find(params[:id])
    @trip_item.destroy

    respond_to do |format|
      format.html { redirect_to trip_items_url }
      format.json { head :no_content }
    end
  end
end
