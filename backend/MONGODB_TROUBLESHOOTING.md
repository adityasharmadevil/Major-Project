# MongoDB Connection Troubleshooting

## Error: DNS Resolution Failed

If you see this error:
```
com.mongodb.MongoConfigurationException: Failed looking up SRV record for '_mongodb._tcp.learnbyaditya.bclzigw.mongodb.net'
Caused by: com.mongodb.spi.dns.DnsWithResponseCodeException: DNS name not found [response code 3]
```

This means your application cannot resolve the MongoDB Atlas DNS SRV record.

## Solutions

### 1. Check Network Connectivity
- Ensure you have an active internet connection
- Try accessing MongoDB Atlas in your browser: https://cloud.mongodb.com
- Test DNS resolution:
  ```bash
  nslookup learnbyaditya.bclzigw.mongodb.net
  ```

### 2. Verify MongoDB Atlas Cluster
- Log in to MongoDB Atlas: https://cloud.mongodb.com
- Go to your cluster and verify it's running
- Check the cluster status (should be "Running")

### 3. Check IP Whitelist
- In MongoDB Atlas, go to **Network Access**
- Add your current IP address (or use `0.0.0.0/0` for development)
- Wait a few minutes for changes to propagate

### 4. Get Correct Connection String
1. In MongoDB Atlas, go to your cluster
2. Click **Connect**
3. Select **Connect your application**
4. Choose **Java** and version **4.11 or later**
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Update `application.properties` with the new connection string

### 5. Use Standard Connection String (Alternative)
If SRV records don't work, try using the standard connection string format:

1. In MongoDB Atlas, get the connection string
2. Instead of `mongodb+srv://`, use `mongodb://`
3. You'll need to specify the replica set members explicitly

Example format:
```
mongodb://username:password@host1:27017,host2:27017,host3:27017/database?ssl=true&replicaSet=replicaSetName&authSource=admin&retryWrites=true&w=majority
```

### 6. Test Connection Manually
Test the connection using MongoDB Compass or mongo shell:
```bash
# Using MongoDB Compass (GUI)
# Download from: https://www.mongodb.com/try/download/compass
# Paste your connection string and test

# Using mongo shell (if installed)
mongo "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### 7. Firewall/VPN Issues
- If you're behind a corporate firewall, it might block DNS queries
- Try connecting from a different network
- Check if VPN is interfering with DNS resolution
- Contact your network administrator if needed

### 8. Temporary Workaround (Development Only)
For development, you can use a local MongoDB instance:

1. Install MongoDB locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. Update `application.properties`:
   ```properties
   spring.data.mongodb.host=localhost
   spring.data.mongodb.port=27017
   spring.data.mongodb.database=journaldb
   # Comment out the URI line
   # spring.data.mongodb.uri=...
   ```

## Current Configuration

Your current connection string:
```
mongodb+srv://Adityasharmacs26:ZkSxj32njRb4X4AN@learnbyaditya.bclzigw.mongodb.net/?retryWrites=true&w=majority&appName=LearnByAditya
```

Database: `journaldb`

## Next Steps

1. **Verify the connection string is correct** - Check MongoDB Atlas dashboard
2. **Test DNS resolution** - Run `nslookup learnbyaditya.bclzigw.mongodb.net`
3. **Check IP whitelist** - Ensure your IP is allowed in MongoDB Atlas
4. **Try standard connection string** - If SRV doesn't work
5. **Use local MongoDB** - For development if Atlas is not accessible

## Still Having Issues?

- Check MongoDB Atlas status page: https://status.mongodb.com
- Review MongoDB Atlas documentation: https://docs.atlas.mongodb.com
- Contact MongoDB support if cluster is not accessible

