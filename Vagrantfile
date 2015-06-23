#
# Simple Vagrantfile, with Chef-solo provisioning
#

Vagrant::Config.run do |config|
  config.vm.box = "precise64"

  # Booting

  # Networking
  # config.vm.network :hostonly, "192.168.33.10"
  # config.vm.network :bridged

  # Port forwarding

  # account service
  config.vm.forward_port 6004, 6004

  # proxy service
  config.vm.forward_port 6005, 6005

  # oauth access service
  config.vm.forward_port 6006, 6006

  #api service
  config.vm.forward_port 6001, 6001
  config.vm.forward_port 6002, 6002

  #mongo
  config.vm.forward_port 27017, 27017, auto_correct: true
  #redis
  config.vm.forward_port 6379, 6379, auto_correct: true
  #debugger
  config.vm.forward_port 5858, 5858

  #port for node-inspector
  config.vm.forward_port 8080, 8080

  # Provisioning
  # Needs build-essential cookbook from https://github.com/opscode/cookbooks

  config.vm.provision :chef_solo do |chef|
      chef.cookbooks_path = "cookbooks"

      chef.json = {
            "nodejs" => {
              :version => "0.10.33"
            }
          }

      chef.add_recipe "apt"
      chef.add_recipe "build-essential"
      chef.add_recipe "mongodb::10gen_repo"
      chef.add_recipe "nodejs"
      chef.add_recipe "redis"
  end
  config.vm.provision :shell, :path => "./Vagrantdata/setup.sh"
end