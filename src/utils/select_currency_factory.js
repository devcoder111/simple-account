export const renderOptions = (
  label_key,
  value_key,
  data,
  placeholder,
  valueArr,
) => {
  let result = [{ value: '', label: `Select ${placeholder}` }];
  let a = {};
  if (valueArr && valueArr.length) {
    data.map((item) => {
      valueArr.map((x) => (a[`${x}`] = item[`${x}`]));
      result.push({
        label: item[`${label_key}`],
        value: item[`${value_key}`],
        ...a,
      });
      return item;
    });
  } else {
    data.map((item) => {
      return result.push({
        label: item[`${label_key}`] + ' - ' + item.currencyIsoCode,
        value: item[`${value_key}`],
        ...a,
      });
    });
  }
  return result;
};
