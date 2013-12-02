Rails.application.config.middleware.use OmniAuth::Builder do
  provider :identity
  provider :facebook, '181388425390583', '2994c10dff3cd33b6d71bd0ba41e2e0e' ,
           :display => 'popup'
end

OmniAuth.config.on_failure = Proc.new { |env|
  OmniAuth::FailureEndpoint.new(env).redirect_to_failure
}