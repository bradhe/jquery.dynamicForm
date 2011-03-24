class TestModelsController < ApplicationController
  # GET /test_models
  # GET /test_models.xml
  def index
    @test_models = TestModel.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @test_models }
    end
  end

  # GET /test_models/1
  # GET /test_models/1.xml
  def show
    @test_model = TestModel.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @test_model }
    end
  end

  # GET /test_models/new
  # GET /test_models/new.xml
  def new
    @test_model = TestModel.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @test_model }
    end
  end

  # GET /test_models/1/edit
  def edit
    @test_model = TestModel.find(params[:id])
  end

  # POST /test_models
  # POST /test_models.xml
  def create
    @test_model = TestModel.new(params[:test_model])

    respond_to do |format|
      if @test_model.save
        format.html { redirect_to(@test_model, :notice => 'Test model was successfully created.') }
        format.xml  { render :xml => @test_model, :status => :created, :location => @test_model }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @test_model.errors, :status => :unprocessable_entity }
        format.json { render :json => @test_model.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /test_models/1
  # PUT /test_models/1.xml
  def update
    @test_model = TestModel.find(params[:id])

    respond_to do |format|
      if @test_model.update_attributes(params[:test_model])
        format.html { redirect_to(@test_model, :notice => 'Test model was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @test_model.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /test_models/1
  # DELETE /test_models/1.xml
  def destroy
    @test_model = TestModel.find(params[:id])
    @test_model.destroy

    respond_to do |format|
      format.html { redirect_to(test_models_url) }
      format.xml  { head :ok }
    end
  end
end
