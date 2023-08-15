const supportEmailTemplate = `
Thank you for supporting Qdabra! <br/>
<br/>
We have received your request and created a support ticket.<br/>
<br/>
Here are your request details:<br/>
<br/>
<table style="width:80%;">
<tbody>
<tr>
<td style="width:25%;">Company name : </td>
<td style="width:75%;">__Company_Name__</td>
</tr>
<tr>
<td style="width:25%;">Name : </td>
<td style="width:75%;">__Name__</td>
</tr>
<tr>
<td style="width:25%;">Product : </td>
<td style="width:75%;">__Product__</td>
</tr>
<tr>
<td style="width:25%;">Issue Summary : </td>
<td style="width:75%;">__Issue_Summary__</td>
</tr>
<tr>
<td style="width:25%;">Issue Detail/Steps : </td>
<td style="width:75%;">__Issue_Steps__</td>
</tr>
<tr>
<td style="width:25%;">Actual Result : </td>
<td style="width:75%;">__Actual_Result__</td>
</tr>
<tr>
<td style="width:25%;">Expected Result : </td>
<td style="width:75%;">__Expected_Result__</td>
</tr>
</tbody>
</table>
<br />
<br />
Check the Customer Support Dashboard to see the latest updates.<br />
<br />
If you have questions or need further assistance, please contact us at <a href="mailto:Support@Qdabra.com">Support@Qdabra.com</a>.<br />
<br />
<br />
<br />
Thanks,<br />
Qdabra Support<br />
<br />`;

module.exports = { supportEmailTemplate };