base_path="/Users/igorkorovchenko/Projects/doka-platform/"
files=( $(ls dist/*/*/index.og.html) )
for in_file in ${files[@]}; do
  tmp=""
  tmp_file="${base_path}${in_file}.t"
  while IFS= read -r line; do
    line="${line//\/styles/../../styles}"
    tmp="${tmp}${line}\n"
  done <<< $(cat $in_file)
  echo $tmp > $tmp_file
  mv $tmp_file $in_file
  input_file="file://${base_path}${in_file}"
  covers="${in_file//index.og.html/images/covers/}"
  mkdir -p $covers
  screenshoteer --w 1200 --h 630 --url $input_file --file "${covers}og.png"
  screenshoteer --w 1024 --h 1024 --url $input_file --file "${covers}twitter.png"
  rm $in_file
done
