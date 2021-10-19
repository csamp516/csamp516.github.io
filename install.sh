#/usr/bin/bash

echo 'Meow!'

while getopts ":-:" opt; do
  case "${opt}" in
    -)
      case "${OPTARG}" in
        no-optional)
          NO_OPTIONAL="true"
          echo "Le second meow"
          ;;
      esac;;
  esac
done
echo "No optional: ${NO_OPTIONAL}"
