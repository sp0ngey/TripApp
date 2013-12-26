require 'pp'

class TripsController < ApplicationController
  # GET /trips
  # GET /trips.json
  def index
    @trips = Trip.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @trips }
    end
  end

  # GET /trips/1
  # GET /trips/1.json
  def show
    @trip = Trip.find(params[:id])
    @trip_items = TripItem.joins(:location).where("trip_items.trip_id" => params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @trip }
    end
  end

  # GET /trips/find.json
  # Brief: Finds all trips associated with a given user. Operation is a GET because no data is modified by this call.
  #        Only responds to JSON GET requests. One parameter `user_id` is expected and MUST match the session's
  #        user_id.
  def find
    #
    # Make sure the user id matches that of the current user.
    # TODO... This makes me think that really we should just use the session variable and not really bother asking
    # TODO... for a user ID in the parameters!
    @currentUser = current_user();
    @requestersUserId = params[:user_id].to_i# TODO... for a user ID in the parameters!

    logger.debug "DBG> Searching for all trips associated with user id=" + @requestersUserId.to_s
    if (@currentUser.nil?) or (@currentUser.id != @requestersUserId)
      logger.debug "DBG> Either user was nil or the id did not match the session id"
      @trips = Array.new
    else
      logger.debug "DBG> User verified okay. Returning parameters"
      @trips = Trip.find_all_by_user_id(@requestersUserId)
    end

    respond_to do |format|
      format.json { render json: @trips }
    end
  end

  # PUT /trips/save.json
  def save
    @jsonInput = JSON.parse(params[:tripData])
    logger.debug "DBG> The entire JSON data is... " + PP.pp(@jsonInput, "")

    #
    # Go through all the locations and if they do not exist in the database then create them. If they do exist
    # then simply record their user id...
    # TODO Can this really guarantee that the location hasn't been totally deleted however. Or perhaps we would say
    # TODO that we never delete locations? But then what if the user is deleting a location because it is no longer
    # TODO valid?! Looks like we do have to cater for deletion, so rather than the optimistic locking, should we
    # TODO in fact be using pessemistic locking?!
    @jsonInput["items"].each do |tripItem|
        location = tripItem["geocode"]["location"]
        fullAddress = tripItem["geocode"]["formatted_address"]
        addrComponents = tripItem["geocode"]["address_components"]

        locationRow = Location.find_by_latitude_and_longitude(location["lat"].to_f, location["lng"].to_f)
        if locationRow.nil?
            # Add this row to the location table
            #t.string  "address"
            #t.float   "longitude"
            #t.float   "latitude"
            #t.string  "city"
            #t.string  "country"
            #locationRow = Location.new(:address => fullAddress, :latitude => location["lat"].to_f, :longitude => locations["lng"].to_f )
        end
    end

    #
    # Now that we have all the location id's we can go about adding the trip item info for this trip. The update
    # operation will be pretty simple... we'll just delete all previous items and write in these new ones!
    # TODO I currently assume non-currenent write access for a trip as only one use should own it. Is this a good
    # TODO assumption or should I detect multiple accesses as a form of possible hacking, for example? Seems like
    # TODO such a detection would be very poor as collision is very unlikely so it's probs useless!

    #
    # Having replaced all the trip items for this trip... we're done!

    respond_to do |format|
      format.json { render json: nil }
    end
  end

  # GET /trips/new
  # GET /trips/new.json
  def new
    @trip = Trip.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @trip }
    end
  end

  # GET /trips/1/edit
  def edit
    @trip = Trip.find(params[:id])
  end

  # POST /trips
  # POST /trips.json
  # Callers:
  #   1. From the landing index.html page to create a trip.
  def create
    @trip = Trip.new(params[:trip])

    respond_to do |format|
      if @trip.save
        format.html { redirect_to @trip, notice: 'Trip was successfully created.' }
        format.json { render json: @trip, status: :created, location: @trip }
      else
        format.html { render action: "new" }
        format.json { render json: @trip.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /trips/1
  # PUT /trips/1.json
  def update
    @trip = Trip.find(params[:id])

    respond_to do |format|
      if @trip.update_attributes(params[:trip])
        format.html { redirect_to @trip, notice: 'Trip was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @trip.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /trips/1
  # DELETE /trips/1.json
  def destroy
    @trip = Trip.find(params[:id])
    @trip.destroy

    respond_to do |format|
      format.html { redirect_to trips_url }
      format.json { head :no_content }
    end
  end

protected

  def getCountryFromGeocodeAddressComponents(addrComponents)
    returnHash = {}
    addrComponents.each do |component|
      if !component["types"].index("country").nil?
        returnHash[:country] = component["long_name"]
      end
    end

  end
end
