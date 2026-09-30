import json
import subprocess
import time
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:3000'
proc = subprocess.Popen(['node', 'app.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
def request(method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(BASE + path, data=data, method=method,
        headers={'Content-Type': 'application/json'} if data is not None else {})
    try:
        with urllib.request.urlopen(req, timeout=3) as res:
            text = res.read().decode()
            return res.status, json.loads(text) if text else None
    except urllib.error.HTTPError as exc:
        text=exc.read().decode()
        return exc.code, json.loads(text) if text else None

try:
    for _ in range(40):
        try:
            request('GET','/')
            break
        except Exception:
            time.sleep(0.25)
    else:
        raise RuntimeError('Server did not start')
    tests=[]
    status, data = request('GET','/')
    assert status==200 and data['nim']=='2428240069' and data['nomorTopik']==14
    tests.append('GET / info 200')
    status, data = request('GET','/paintings')
    assert status==200 and isinstance(data,list) and len(data)>=3
    tests.append('GET /paintings initial array 200')
    status, data = request('GET','/paintings/1')
    assert status==200 and data['id']==1
    tests.append('GET /paintings/1 200')
    status, data = request('GET','/paintings?aliran=realisme')
    assert status==200 and all(x['aliran']=='realisme' for x in data)
    tests.append('GET filter 200')
    status, data = request('GET','/paintings/999')
    assert status==404 and data['status']=='error' and data['data'] is None
    tests.append('GET unknown ID 404 JSON')
    payload={'judul':'Uji Baru','pelukis':'Tester','aliran':'abstrak','tahunDibuat':2025,'harga':10000}
    status, data = request('POST','/paintings',payload)
    assert status==201 and data['data']['id']==4
    tests.append('POST valid 201 ID auto')
    status, data = request('POST','/paintings',{'judul':'','pelukis':'Tester','aliran':'abstrak','harga':10000})
    assert status==400 and data['data'] is None
    tests.append('POST invalid required field 400 JSON')
    payload2={'judul':'Revisi','pelukis':'Tester 2','aliran':'abstrak','tahunDibuat':2026,'harga':25000}
    status,data=request('PUT','/paintings/4',payload2)
    assert status==200 and data['data']['judul']=='Revisi'
    tests.append('PUT valid full replacement 200')
    status,data=request('PUT','/paintings/999',payload2)
    assert status==404 and data['data'] is None
    tests.append('PUT unknown ID 404')
    status,data=request('DELETE','/paintings/4')
    assert status==200 and data['data'] is None
    tests.append('DELETE valid 200 JSON null')
    status,data=request('DELETE','/paintings/999')
    assert status==404 and data['data'] is None
    tests.append('DELETE unknown ID 404')
    status,data=request('GET','/unknown-route')
    assert status==404 and data['message']=='Endpoint tidak ditemukan'
    tests.append('catch-all 404 JSON')
    print('\n'.join('PASS '+x for x in tests))
finally:
    proc.terminate()
    try: proc.wait(timeout=5)
    except subprocess.TimeoutExpired: proc.kill()
