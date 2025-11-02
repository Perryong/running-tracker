import argparse
import garth


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("email", help="garmin account email")
    parser.add_argument("password", help="garmin account password")
    parser.add_argument(
        "--is-cn", dest="is_cn", action="store_true", help="garmin account in China"
    )
    options = parser.parse_args()
    if options.is_cn:
        garth.configure(domain="garmin.cn", ssl_verify=False)
    else:
        garth.configure(domain="garmin.com")

    garth.login(options.email, options.password)
    print(garth.client.dumps())
